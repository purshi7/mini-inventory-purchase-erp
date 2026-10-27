
package com.boomax.inventoryerp.repository;

import com.boomax.inventoryerp.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    boolean existsByEmailIgnoreCase(String email);
}
