
package com.boomax.inventoryerp.service;

import com.boomax.inventoryerp.dto.PurchaseOrderRequest;
import com.boomax.inventoryerp.entity.*;
import com.boomax.inventoryerp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.boomax.inventoryerp.dto.PurchaseOrderResponse;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository orderRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository orderRepository,
            VendorRepository vendorRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public PurchaseOrder create(PurchaseOrderRequest request) {
        Vendor vendor = vendorRepository.findById(request.vendorId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Vendor not found"));

        PurchaseOrder order = new PurchaseOrder(vendor, request.notes());

        for (PurchaseOrderRequest.ItemRequest input : request.items()) {
            Product product = productRepository.findById(input.productId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: " + input.productId()));

            order.addItem(new PurchaseOrderItem(
                    product, input.quantity(), input.unitPrice()));
        }

        return orderRepository.save(order);
    }


@Transactional(readOnly = true)
public List<PurchaseOrderResponse> getAll() {
    return orderRepository.findAll().stream()
            .map(order -> new PurchaseOrderResponse(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getVendor().getName(),
                    order.getOrderDate(),
                    order.getStatus(),
                    order.getTotalAmount(),
                    order.getNotes(),
                    order.getItems().stream()
                            .map(item ->
                                    new PurchaseOrderResponse.ItemResponse(
                                            item.getId(),
                                            item.getProduct().getId(),
                                            item.getProduct().getName(),
                                            item.getOrderedQuantity(),
                                            item.getReceivedQuantity(),
                                            item.getUnitPrice(),
                                            item.getLineTotal()
                                    ))
                            .toList()
            ))
            .toList();
}

}
