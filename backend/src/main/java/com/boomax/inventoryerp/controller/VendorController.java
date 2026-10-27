
package com.boomax.inventoryerp.controller;

import com.boomax.inventoryerp.dto.VendorRequest;
import com.boomax.inventoryerp.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Object create(@Valid @RequestBody VendorRequest request) {
        return vendorService.create(request);
    }

    @GetMapping
    public List<?> findAll() {
        return vendorService.findAll();
    }

    @PutMapping("/{id}")
    public Object update(
            @PathVariable Long id,
            @Valid @RequestBody VendorRequest request) {
        return vendorService.update(id, request);
    }
}
