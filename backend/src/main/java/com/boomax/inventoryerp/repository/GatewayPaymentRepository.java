
package com.boomax.inventoryerp.repository;

import com.boomax.inventoryerp.entity.GatewayPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GatewayPaymentRepository
        extends JpaRepository<GatewayPayment, Long> {

    Optional<GatewayPayment> findByIdempotencyKey(String idempotencyKey);

    Optional<GatewayPayment> findByRazorpayOrderId(String razorpayOrderId);
}
