
package com.boomax.inventoryerp.controller;

import com.boomax.inventoryerp.dto.PurchaseOrderRequest;
import com.boomax.inventoryerp.dto.PurchaseOrderResponse;
import com.boomax.inventoryerp.entity.PurchaseOrder;
import com.boomax.inventoryerp.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    public PurchaseOrderController(PurchaseOrderService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrder create(
            @Valid @RequestBody PurchaseOrderRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<PurchaseOrderResponse> getAll() {
        return service.getAll();
    }
}
