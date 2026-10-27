
package com.boomax.inventoryerp.repository;

import com.boomax.inventoryerp.entity.GoodsReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GoodsReceiptRepository
        extends JpaRepository<GoodsReceipt, Long> {

    Optional<GoodsReceipt> findByIdempotencyKey(String idempotencyKey);
}
