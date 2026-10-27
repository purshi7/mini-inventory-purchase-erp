
package com.boomax.inventoryerp.controller;

import com.boomax.inventoryerp.dto.VendorOutstandingResponse;
import com.boomax.inventoryerp.service.VendorOutstandingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor-payments/outstanding")
public class VendorOutstandingController {

    private final VendorOutstandingService outstandingService;

    public VendorOutstandingController(
            VendorOutstandingService outstandingService) {
        this.outstandingService = outstandingService;
    }

    @GetMapping
    public List<VendorOutstandingResponse> getAll() {
        return outstandingService.getAll();
    }

    @GetMapping("/vendor/{vendorId}")
    public VendorOutstandingResponse getByVendor(
            @PathVariable Long vendorId) {
        return outstandingService.getByVendor(vendorId);
    }
}
