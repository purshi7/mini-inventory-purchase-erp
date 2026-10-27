
package com.boomax.inventoryerp.dto;

import java.math.BigDecimal;

public record VendorOutstandingResponse(
        Long vendorId,
        String vendorName,
        BigDecimal totalPurchaseAmount,
        BigDecimal totalPaid,
        BigDecimal outstandingAmount
) {
}
