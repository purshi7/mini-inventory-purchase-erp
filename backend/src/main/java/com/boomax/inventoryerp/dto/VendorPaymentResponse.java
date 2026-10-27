
package com.boomax.inventoryerp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record VendorPaymentResponse(
        Long id,
        Long vendorId,
        String vendorName,
        String idempotencyKey,
        BigDecimal amount,
        LocalDate paymentDate,
        String method,
        String referenceNumber,
        String notes,
        OffsetDateTime createdAt
) {
}
