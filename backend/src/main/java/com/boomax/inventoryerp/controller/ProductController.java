
package com.boomax.inventoryerp.controller;

import com.boomax.inventoryerp.dto.ProductRequest;
import com.boomax.inventoryerp.entity.Product;
import com.boomax.inventoryerp.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @RequestBody ProductRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<Product> findAll() {
        return service.findAll();
    }

    
@PutMapping("/{id}")
public Product update(
        @PathVariable Long id,
        @Valid @RequestBody ProductRequest request) {
    return service.update(id, request);
}

}
