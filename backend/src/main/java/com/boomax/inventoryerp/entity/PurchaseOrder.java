
package com.boomax.inventoryerp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(nullable = false)
    private String status = "OPEN";

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "purchaseOrder",
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items = new ArrayList<>();

    protected PurchaseOrder() {}

    public void refreshStatus() {
    if (items.isEmpty()) {
        this.status = "OPEN";
        return;
    }

    boolean allReceived = items.stream().allMatch(item ->
            item.getReceivedQuantity()
                    .compareTo(item.getOrderedQuantity()) >= 0);

    boolean anyReceived = items.stream().anyMatch(item ->
            item.getReceivedQuantity()
                    .compareTo(BigDecimal.ZERO) > 0);

    if (allReceived) {
        this.status = "RECEIVED";
    } else if (anyReceived) {
        this.status = "PARTIALLY_RECEIVED";
    } else {
        this.status = "OPEN";
    }
}


    public PurchaseOrder(Vendor vendor, String notes) {
        this.vendor = vendor;
        this.notes = notes;
        this.orderDate = LocalDate.now();
        this.orderNumber = "PO-" +
                java.util.UUID.randomUUID().toString()
                        .substring(0, 8).toUpperCase();
        this.status = "OPEN";
    }

    public void addItem(PurchaseOrderItem item) {
        item.setPurchaseOrder(this);
        items.add(item);
        totalAmount = totalAmount.add(item.getLineTotal());
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public Vendor getVendor() { return vendor; }
    public LocalDate getOrderDate() { return orderDate; }
    public String getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getNotes() { return notes; }
    public List<PurchaseOrderItem> getItems() { return items; }

    
}

