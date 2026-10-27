
package com.boomax.inventoryerp.controller;

import com.boomax.inventoryerp.dto.VendorPaymentRequest;
import com.boomax.inventoryerp.dto.VendorPaymentResponse;
import com.boomax.inventoryerp.service.VendorPaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor-payments")
public class VendorPaymentController {

    private final VendorPaymentService paymentService;

    public VendorPaymentController(VendorPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VendorPaymentResponse create(
            @Valid @RequestBody VendorPaymentRequest request) {
        return paymentService.create(request);
    }

    @GetMapping
    public List<VendorPaymentResponse> getAll() {
        return paymentService.getAll();
    }

    @GetMapping("/vendor/{vendorId}")
    public List<VendorPaymentResponse> getByVendor(
            @PathVariable Long vendorId) {
        return paymentService.getByVendor(vendorId);
    }
}
