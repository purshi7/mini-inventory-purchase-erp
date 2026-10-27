
package com.boomax.inventoryerp.service;

import com.boomax.inventoryerp.dto.ProductRequest;
import com.boomax.inventoryerp.entity.Product;
import com.boomax.inventoryerp.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Product create(ProductRequest request) {
        String sku = request.sku().trim().toUpperCase(Locale.ROOT);

        if (repository.existsBySkuIgnoreCase(sku)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Product SKU already exists");
        }

        Product product = new Product();
        product.setSku(sku);
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setUnit(request.unit().trim());

        return repository.saveAndFlush(product);
    }

    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return repository.findAll();
    }

    
@Transactional
public Product update(Long id, ProductRequest request) {
    Product product = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Product not found"));

    String sku = request.sku().trim().toUpperCase(Locale.ROOT);

    if (repository.existsBySkuIgnoreCase(sku)
            && !product.getSku().equalsIgnoreCase(sku)) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Product SKU already exists");
    }

    product.setSku(sku);
    product.setName(request.name().trim());
    product.setDescription(request.description());
    product.setUnit(request.unit().trim());

    return repository.saveAndFlush(product);
}

}
