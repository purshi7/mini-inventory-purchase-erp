
package com.boomax.inventoryerp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderResponse(
        Long id,
        String orderNumber,
        String vendorName,
        LocalDate orderDate,
        String status,
        BigDecimal totalAmount,
        String notes,
        List<ItemResponse> items
) {
    public record ItemResponse(
            Long id,
            Long productId,
            String productName,
            BigDecimal orderedQuantity,
            BigDecimal receivedQuantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {}
}
