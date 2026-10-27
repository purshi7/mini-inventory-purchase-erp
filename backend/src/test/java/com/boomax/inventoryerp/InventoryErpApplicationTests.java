package com.boomax.inventoryerp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class InventoryErpApplicationTests {
    @Test
    void contextLoads() {
        // Requires a reachable PostgreSQL database because Flyway migrations run at startup.
    }
}
