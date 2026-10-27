
package com.boomax.inventoryerp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record PurchaseOrderRequest(
        @NotNull Long vendorId,
        String notes,
        @NotEmpty List<@Valid ItemRequest> items
) {
    public record ItemRequest(
        @NotNull Long productId,
        @NotNull @DecimalMin("0.01") BigDecimal quantity,
        @NotNull @DecimalMin("0.01") BigDecimal unitPrice
) {}
}
