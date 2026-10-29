
package com.boomax.inventoryerp.service;

import com.boomax.inventoryerp.entity.GatewayPayment;
import com.boomax.inventoryerp.repository.GatewayPaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.boomax.inventoryerp.dto.RazorpayVerificationRequest;
import com.razorpay.Utils;
import org.springframework.dao.DataIntegrityViolationException;
import com.razorpay.Payment;

@Service
public class RazorpayPaymentService {

    private final GatewayPaymentRepository paymentRepository;
    private final String keyId;
    private final String keySecret;

    public RazorpayPaymentService(
            GatewayPaymentRepository paymentRepository,
            @Value("${razorpay.key-id}") String keyId,
            @Value("${razorpay.key-secret}") String keySecret) {
        this.paymentRepository = paymentRepository;
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    @Transactional
    public JSONObject createTestOrder(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()
                || idempotencyKey.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "A valid idempotency key is required");
        }

        var existing = paymentRepository.findByIdempotencyKey(idempotencyKey);

        if (existing.isPresent()) {
            GatewayPayment payment = existing.get();

            if (payment.getRazorpayOrderId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Previous order creation is incomplete; use a new key");
            }

            return orderResponse(payment);
        }

        // Demo only: fixed amount of ₹10. Do not accept client-supplied amounts.
        long amountPaise = 1000L;
        GatewayPayment payment = paymentRepository.saveAndFlush(
                new GatewayPayment(idempotencyKey, amountPaise));

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("receipt", "gateway_" + payment.getId());

            Order order = client.orders.create(options);

            payment.setRazorpayOrderId(order.get("id"));
            paymentRepository.save(payment);

            return orderResponse(payment);
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not create Razorpay order. Check server logs.");
        }
    }



@Transactional
public JSONObject verifyPayment(RazorpayVerificationRequest request) {
    if (request == null
            || request.getRazorpayOrderId() == null
            || request.getRazorpayOrderId().isBlank()
            || request.getRazorpayPaymentId() == null
            || request.getRazorpayPaymentId().isBlank()
            || request.getRazorpaySignature() == null
            || request.getRazorpaySignature().isBlank()) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Payment verification details are required");
    }

    GatewayPayment payment = paymentRepository
            .findByRazorpayOrderId(request.getRazorpayOrderId())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Payment order not found"));

    // Idempotent retry: this payment was already verified previously.
    if ("PAID".equals(payment.getStatus())) {
        if (request.getRazorpayPaymentId()
                .equals(payment.getRazorpayPaymentId())) {
            return verificationResponse(payment);
        }

        throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Order has already been paid");
    }

    if (!"CREATED".equals(payment.getStatus())) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Order is not available for payment");
    }

    // 1. Verify the checkout signature.
    try {
        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", request.getRazorpayOrderId());
        attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
        attributes.put("razorpay_signature", request.getRazorpaySignature());

        if (!Utils.verifyPaymentSignature(attributes, keySecret)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid payment signature");
        }
    } catch (ResponseStatusException ex) {
        throw ex;
    } catch (Exception ex) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Payment signature verification failed");
    }

    // 2. Independently fetch payment details from Razorpay.
    final Payment razorpayPayment;

    try {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        razorpayPayment = client.payments.fetch(request.getRazorpayPaymentId());
    } catch (Exception ex) {
        // Do not mark the payment PAID if Razorpay cannot be reached.
        throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Could not verify payment status with Razorpay. Please retry.");
    }

    // 3. Check that the fetched payment matches our order.
  String actualPaymentId =
        String.valueOf((Object) razorpayPayment.get("id"));

String actualOrderId =
        String.valueOf((Object) razorpayPayment.get("order_id"));

String actualCurrency =
        String.valueOf((Object) razorpayPayment.get("currency"));

String actualStatus =
        String.valueOf((Object) razorpayPayment.get("status"));

String actualAmount =
        String.valueOf((Object) razorpayPayment.get("amount"));

    if (!request.getRazorpayPaymentId().equals(actualPaymentId)
            || !payment.getRazorpayOrderId().equals(actualOrderId)
            || payment.getAmountPaise() != Long.parseLong(actualAmount)
            || !payment.getCurrency().equals(actualCurrency)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Razorpay payment details do not match the expected order");
    }

    // 4. Only accept captured payments.
    if (!"captured".equalsIgnoreCase(actualStatus)) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Payment is not captured yet. Current status: " + actualStatus);
    }

    // 5. Save PAID only after all checks have passed.
    payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
    payment.setStatus("PAID");

    try {
        paymentRepository.saveAndFlush(payment);
    } catch (DataIntegrityViolationException ex) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Payment ID has already been used");
    }

    return verificationResponse(payment);
}


private JSONObject verificationResponse(GatewayPayment payment) {
    JSONObject response = new JSONObject();
    response.put("orderId", payment.getRazorpayOrderId());
    response.put("paymentId", payment.getRazorpayPaymentId());
    response.put("status", payment.getStatus());
    return response;
}

    private JSONObject orderResponse(GatewayPayment payment) {
        JSONObject response = new JSONObject();
        response.put("keyId", keyId);
        response.put("orderId", payment.getRazorpayOrderId());
        response.put("amount", payment.getAmountPaise());
        response.put("currency", payment.getCurrency());
        response.put("status", payment.getStatus());
        return response;
    }
}
