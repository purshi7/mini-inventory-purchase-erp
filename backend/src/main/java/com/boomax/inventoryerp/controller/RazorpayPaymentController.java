
package com.boomax.inventoryerp.controller;

import com.boomax.inventoryerp.service.RazorpayPaymentService;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import com.boomax.inventoryerp.dto.RazorpayVerificationRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/payments")
public class RazorpayPaymentController {

    private final RazorpayPaymentService paymentService;

    public RazorpayPaymentController(
            RazorpayPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createOrder(
            @RequestHeader("Idempotency-Key") String idempotencyKey) {

        JSONObject result = paymentService.createTestOrder(idempotencyKey);
        return result.toMap();
    }


@PostMapping("/verify")
public Map<String, Object> verifyPayment(
        @Valid @RequestBody RazorpayVerificationRequest request) {
    JSONObject result = paymentService.verifyPayment(request);
    return result.toMap();
}

}
