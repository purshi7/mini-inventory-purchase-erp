
package com.boomax.inventoryerp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

   @Column(name = "ordered_quantity", nullable = false, precision = 12, scale = 2)
private BigDecimal orderedQuantity;

@Column(name = "received_quantity", nullable = false, precision = 12, scale = 2)
private BigDecimal receivedQuantity = BigDecimal.ZERO;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTotal;

    protected PurchaseOrderItem() {}

public PurchaseOrderItem(
        Product product, BigDecimal quantity, BigDecimal unitPrice) {

    this.product = product;
    this.orderedQuantity = quantity;
    this.receivedQuantity = BigDecimal.ZERO;
    this.unitPrice = unitPrice;

    this.lineTotal = unitPrice.multiply(quantity)
            .setScale(2, java.math.RoundingMode.HALF_UP);
}

    public void setPurchaseOrder(PurchaseOrder purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public BigDecimal getOrderedQuantity() {
    return orderedQuantity;
}

public BigDecimal getReceivedQuantity() {
    return receivedQuantity;
}
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getLineTotal() { return lineTotal; }

    
public void addReceivedQuantity(java.math.BigDecimal quantity) {
    if (quantity == null ||
            quantity.compareTo(java.math.BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException(
                "Received quantity must be positive");
    }

    if (this.receivedQuantity.add(quantity)
            .compareTo(this.orderedQuantity) > 0) {
        throw new IllegalArgumentException(
                "Cannot receive more than the ordered quantity");
    }

    this.receivedQuantity = this.receivedQuantity.add(quantity);
}

}
