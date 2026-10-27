
package com.boomax.inventoryerp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VendorPaymentRequest(

        @NotNull(message = "Vendor ID is required")
        @Positive(message = "Vendor ID must be positive")
        Long vendorId,

        @NotBlank(message = "Idempotency key is required")
        @Size(max = 100, message = "Idempotency key must not exceed 100 characters")
        String idempotencyKey,

        @NotNull(message = "Payment amount is required")
        @DecimalMin(value = "0.01", message = "Payment amount must be at least 0.01")
        BigDecimal amount,

        LocalDate paymentDate,

        @Size(max = 30, message = "Payment method must not exceed 30 characters")
        String method,

        @Size(max = 100, message = "Reference number must not exceed 100 characters")
        String referenceNumber,

        String notes
) {
}
