
package com.boomax.inventoryerp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goods_receipt_id", nullable = false)
    private GoodsReceipt goodsReceipt;

    @Column(name = "movement_type", nullable = false, length = 30)
    private String movementType;

    @Column(name = "quantity_delta", nullable = false, precision = 14, scale = 3)
    private BigDecimal quantityDelta;

    @Column(name = "reference_type", nullable = false, length = 30)
    private String referenceType;

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Column(name = "idempotency_key", nullable = false, length = 100)
    private String idempotencyKey;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Retain these existing columns if they are present in your database.
    @Column(name = "quantity", precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(name = "stock_after", precision = 14, scale = 3)
    private BigDecimal stockAfter;

    protected StockMovement() {}

    public StockMovement(
            Product product,
            GoodsReceipt goodsReceipt,
            String movementType,
            BigDecimal quantity,
            BigDecimal stockAfter) {

        this.product = product;
        this.goodsReceipt = goodsReceipt;
        this.movementType = movementType;
        this.quantityDelta = quantity;
        this.quantity = quantity;
        this.stockAfter = stockAfter;
        this.referenceType = "GOODS_RECEIPT";
        this.referenceId = goodsReceipt.getId();
        this.idempotencyKey = UUID.randomUUID().toString();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public GoodsReceipt getGoodsReceipt() {
        return goodsReceipt;
    }

    public String getMovementType() {
        return movementType;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getQuantityDelta() {
        return quantityDelta;
    }

    public BigDecimal getStockAfter() {
        return stockAfter;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
