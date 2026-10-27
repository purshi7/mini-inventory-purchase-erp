
package com.boomax.inventoryerp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "goods_receipt_items")
public class GoodsReceiptItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goods_receipt_id", nullable = false)
    private GoodsReceipt goodsReceipt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_item_id", nullable = false)
    private PurchaseOrderItem purchaseOrderItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "received_quantity", nullable = false,
            precision = 12, scale = 2)
    private BigDecimal receivedQuantity;

    @Column(name = "unit_cost", nullable = false,
            precision = 12, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "line_total", nullable = false,
            precision = 14, scale = 2)
    private BigDecimal lineTotal;

    protected GoodsReceiptItem() {}

    public GoodsReceiptItem(
            PurchaseOrderItem purchaseOrderItem,
            BigDecimal receivedQuantity) {
        this.purchaseOrderItem = purchaseOrderItem;
        this.product = purchaseOrderItem.getProduct();
        this.receivedQuantity = receivedQuantity;
        this.unitCost = purchaseOrderItem.getUnitPrice();
        this.lineTotal = unitCost.multiply(receivedQuantity)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public void setGoodsReceipt(GoodsReceipt goodsReceipt) {
        this.goodsReceipt = goodsReceipt;
    }

    public Long getId() { return id; }
    public PurchaseOrderItem getPurchaseOrderItem() {
        return purchaseOrderItem;
    }
    public Product getProduct() { return product; }
    public BigDecimal getReceivedQuantity() {
        return receivedQuantity;
    }
    public BigDecimal getUnitCost() { return unitCost; }
    public BigDecimal getLineTotal() { return lineTotal; }
}
