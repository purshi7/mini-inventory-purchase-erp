
package com.boomax.inventoryerp.service;

import com.boomax.inventoryerp.dto.VendorPaymentRequest;
import com.boomax.inventoryerp.dto.VendorPaymentResponse;
import com.boomax.inventoryerp.entity.Vendor;
import com.boomax.inventoryerp.entity.VendorPayment;
import com.boomax.inventoryerp.repository.VendorPaymentRepository;
import com.boomax.inventoryerp.repository.VendorRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.boomax.inventoryerp.repository.PurchaseOrderRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class VendorPaymentService {

    private static final Set<String> ALLOWED_METHODS = Set.of(
            "CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "OTHER"
    );

    private final VendorPaymentRepository paymentRepository;
    private final VendorRepository vendorRepository;
    private final PurchaseOrderRepository orderRepository;

 public VendorPaymentService(
        VendorPaymentRepository paymentRepository,
        VendorRepository vendorRepository,
        PurchaseOrderRepository orderRepository) {
    this.paymentRepository = paymentRepository;
    this.vendorRepository = vendorRepository;
    this.orderRepository = orderRepository;
}

    @Transactional
    public VendorPaymentResponse create(VendorPaymentRequest request) {
        // Repeated requests with the same key must not create a second payment.
        var existing = paymentRepository.findByIdempotencyKey(
                request.idempotencyKey());

        if (existing.isPresent()) {
            VendorPayment payment = existing.get();

            // Do not silently accept a different payment under the same key.
            if (!payment.getAmount().equals(request.amount())
                    || !payment.getVendor().getId().equals(request.vendorId())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Idempotency key was already used for a different payment");
            }

            return toResponse(payment);
        }

        Vendor vendor = vendorRepository.findById(request.vendorId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vendor not found"));

        if (!vendor.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Cannot pay an inactive vendor");
        }

        if (request.amount() == null
                || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Payment amount must be positive");
        }

        
BigDecimal totalPurchases =
        orderRepository.sumOrderTotalByVendorId(request.vendorId());

BigDecimal totalPaid =
        paymentRepository.sumPaymentsByVendorId(request.vendorId());

BigDecimal outstanding = totalPurchases.subtract(totalPaid);

if (outstanding.compareTo(BigDecimal.ZERO) < 0) {
    throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Existing payments exceed the recorded purchase total");
}

if (request.amount().compareTo(outstanding) > 0) {
    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Payment exceeds outstanding balance. Maximum payable: "
                    + outstanding);
}


        String method = request.method() == null
                || request.method().isBlank()
                ? "BANK_TRANSFER"
                : request.method().trim().toUpperCase(Locale.ROOT);

        if (!ALLOWED_METHODS.contains(method)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid payment method. Allowed: " + ALLOWED_METHODS);
        }

        VendorPayment payment = new VendorPayment(
                vendor,
                request.idempotencyKey().trim(),
                request.amount(),
                request.paymentDate(),
                method,
                request.referenceNumber(),
                request.notes()
        );

        try {
            payment = paymentRepository.saveAndFlush(payment);
        } catch (DataIntegrityViolationException ex) {
            // Handles concurrent duplicate-key requests at the database.
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payment idempotency key already exists");
        }

        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<VendorPaymentResponse> getByVendor(Long vendorId) {
        if (!vendorRepository.existsById(vendorId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Vendor not found");
        }

        return paymentRepository
                .findByVendor_IdOrderByPaymentDateDescIdDesc(vendorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VendorPaymentResponse> getAll() {
        return paymentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private VendorPaymentResponse toResponse(VendorPayment payment) {
        return new VendorPaymentResponse(
                payment.getId(),
                payment.getVendor().getId(),
                payment.getVendor().getName(),
                payment.getIdempotencyKey(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getMethod(),
                payment.getReferenceNumber(),
                payment.getNotes(),
                payment.getCreatedAt()
        );
    }
}
