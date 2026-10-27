
package com.boomax.inventoryerp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record GoodsReceiptRequest(
        @NotNull Long purchaseOrderId,
        @NotBlank String idempotencyKey,
        String notes,
        @NotEmpty List<@Valid ItemRequest> items
) {
    public record ItemRequest(
            @NotNull Long purchaseOrderItemId,
            @NotNull @DecimalMin("0.01") BigDecimal receivedQuantity
    ) {}
}
