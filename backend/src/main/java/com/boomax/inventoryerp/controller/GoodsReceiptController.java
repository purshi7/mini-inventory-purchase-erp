
package com.boomax.inventoryerp.controller;

import com.boomax.inventoryerp.dto.GoodsReceiptRequest;
import com.boomax.inventoryerp.entity.GoodsReceipt;
import com.boomax.inventoryerp.service.GoodsReceiptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/goods-receipts")
public class GoodsReceiptController {

    private final GoodsReceiptService service;

    public GoodsReceiptController(GoodsReceiptService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(
            @Valid @RequestBody GoodsReceiptRequest request) {

        GoodsReceipt receipt = service.create(request);

        return Map.of(
                "message", "Goods receipt created successfully",
                "receiptId", receipt.getId(),
                "receiptNumber", receipt.getReceiptNumber()
        );
    }
}
