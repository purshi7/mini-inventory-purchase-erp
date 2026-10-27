
package com.boomax.inventoryerp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "vendor_payments")
public class VendorPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "idempotency_key", nullable = false,
            unique = true, length = 100)
    private String idempotencyKey;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false, length = 30)
    private String method = "BANK_TRANSFER";

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected VendorPayment() {
    }

    public VendorPayment(
            Vendor vendor,
            String idempotencyKey,
            BigDecimal amount,
            LocalDate paymentDate,
            String method,
            String referenceNumber,
            String notes) {

        this.vendor = vendor;
        this.idempotencyKey = idempotencyKey;
        this.amount = amount;
        this.paymentDate = paymentDate != null
                ? paymentDate : LocalDate.now();
        this.method = method != null && !method.isBlank()
                ? method : "BANK_TRANSFER";
        this.referenceNumber = referenceNumber;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public String getMethod() {
        return method;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public String getNotes() {
        return notes;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
