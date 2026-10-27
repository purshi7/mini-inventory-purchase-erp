
package com.boomax.inventoryerp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductRequest(
    @NotBlank @Size(max = 80) String sku,
    @NotBlank @Size(max = 180) String name,
    String description,
    @NotBlank @Size(max = 30) String unit
) {}
