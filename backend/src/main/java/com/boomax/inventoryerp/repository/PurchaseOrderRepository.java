
package com.boomax.inventoryerp.repository;

import com.boomax.inventoryerp.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long> {
            @Query("""
    SELECT COALESCE(SUM(po.totalAmount), 0)
    FROM PurchaseOrder po
    WHERE po.vendor.id = :vendorId
      AND po.status <> 'CANCELLED'
    """)
BigDecimal sumOrderTotalByVendorId(
        @Param("vendorId") Long vendorId);
}
