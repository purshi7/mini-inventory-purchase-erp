
package com.boomax.inventoryerp.service;

import com.boomax.inventoryerp.dto.GoodsReceiptRequest;
import com.boomax.inventoryerp.entity.*;
import com.boomax.inventoryerp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.boomax.inventoryerp.repository.StockMovementRepository;

import java.util.HashSet;
import java.util.Set;

@Service
public class GoodsReceiptService {

    private final GoodsReceiptRepository receiptRepository;
    private final PurchaseOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

public GoodsReceiptService(
        GoodsReceiptRepository receiptRepository,
        PurchaseOrderRepository orderRepository,
        ProductRepository productRepository,
        StockMovementRepository stockMovementRepository) {
    this.receiptRepository = receiptRepository;
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.stockMovementRepository = stockMovementRepository;
}

    @Transactional
    public GoodsReceipt create(GoodsReceiptRequest request) {
        // Return the existing receipt if this request was already processed.
        var existing = receiptRepository.findByIdempotencyKey(
                request.idempotencyKey());

        if (existing.isPresent()) {
            return existing.get();
        }

        PurchaseOrder order = orderRepository.findById(
                request.purchaseOrderId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Purchase order not found"));

        if ("CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException(
                    "Cannot receive goods for a cancelled order");
        }

        GoodsReceipt receipt = new GoodsReceipt(
                order, request.idempotencyKey(), request.notes());

        Set<Long> submittedItemIds = new HashSet<>();

        for (GoodsReceiptRequest.ItemRequest input : request.items()) {
            if (!submittedItemIds.add(input.purchaseOrderItemId())) {
                throw new IllegalArgumentException(
                        "Duplicate purchase order item in receipt");
            }

            PurchaseOrderItem orderItem = order.getItems().stream()
                    .filter(item -> item.getId().equals(
                            input.purchaseOrderItemId()))
                    .findFirst()
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Item does not belong to this purchase order"));

            // Validates that cumulative received quantity will not exceed
            // the ordered quantity.
            orderItem.addReceivedQuantity(input.receivedQuantity());

            Product product = orderItem.getProduct();
            product.addStock(input.receivedQuantity());

            receipt.addItem(new GoodsReceiptItem(
                    orderItem, input.receivedQuantity()));
        }

       order.refreshStatus();

// Save receipt and receipt items first so the receipt gets an ID.
GoodsReceipt savedReceipt = receiptRepository.saveAndFlush(receipt);

// Record a stock movement for each received item.
for (GoodsReceiptItem receiptItem : savedReceipt.getItems()) {
    Product product = receiptItem.getPurchaseOrderItem().getProduct();

    stockMovementRepository.save(
            new StockMovement(
                    product,
                    savedReceipt,
                    "GOODS_RECEIPT",
                    receiptItem.getReceivedQuantity(),
                    product.getCurrentStock()
            )
    );
}

// All changes commit or roll back together.
return savedReceipt;
    }
}
