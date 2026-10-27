
package com.boomax.inventoryerp.repository;

import com.boomax.inventoryerp.entity.VendorPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface VendorPaymentRepository
        extends JpaRepository<VendorPayment, Long> {

@Query("""
    SELECT COALESCE(SUM(p.amount), 0)
    FROM VendorPayment p
    WHERE p.vendor.id = :vendorId
    """)
BigDecimal sumPaymentsByVendorId(
        @Param("vendorId") Long vendorId);
    Optional<VendorPayment> findByIdempotencyKey(
            String idempotencyKey);

    List<VendorPayment> findByVendor_IdOrderByPaymentDateDescIdDesc(
            Long vendorId);
}
