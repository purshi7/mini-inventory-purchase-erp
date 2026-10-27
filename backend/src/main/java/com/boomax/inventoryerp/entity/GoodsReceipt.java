
package com.boomax.inventoryerp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goods_receipts")
public class GoodsReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", nullable = false, unique = true)
    private String receiptNumber;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "goodsReceipt",
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoodsReceiptItem> items = new ArrayList<>();

    protected GoodsReceipt() {}

    public GoodsReceipt(
            PurchaseOrder purchaseOrder,
            String idempotencyKey,
            String notes) {
        this.purchaseOrder = purchaseOrder;
        this.idempotencyKey = idempotencyKey;
        this.notes = notes;
        this.receivedAt = LocalDateTime.now();
        this.receiptNumber = "GR-" +
                java.util.UUID.randomUUID().toString()
                        .substring(0, 8).toUpperCase();
    }

    public void addItem(GoodsReceiptItem item) {
        item.setGoodsReceipt(this);
        items.add(item);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getReceiptNumber() { return receiptNumber; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public LocalDateTime getReceivedAt() { return receivedAt; }
    public String getNotes() { return notes; }
    public List<GoodsReceiptItem> getItems() { return items; }
}
