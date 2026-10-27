
package com.boomax.inventoryerp.service;

import com.boomax.inventoryerp.dto.VendorRequest;
import com.boomax.inventoryerp.entity.Vendor;
import com.boomax.inventoryerp.repository.VendorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class VendorService {

    private final VendorRepository repository;

    public VendorService(VendorRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Vendor create(VendorRequest request) {
        Vendor vendor = new Vendor();
        vendor.setName(request.name().trim());

        String email = request.email();
        if (email != null && !email.isBlank()) {
            email = email.trim().toLowerCase(Locale.ROOT);

            if (repository.existsByEmailIgnoreCase(email)) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Vendor email already exists");
            }
            vendor.setEmail(email);
        }

        vendor.setPhone(request.phone());
        vendor.setAddress(request.address());

        return repository.saveAndFlush(vendor);
    }

    @Transactional(readOnly = true)
    public List<Vendor> findAll() {
        return repository.findAll();
    }

    
@Transactional
public Vendor update(Long id, VendorRequest request) {
    Vendor vendor = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Vendor not found"));

    String email = request.email();

    if (email != null && !email.isBlank()) {
        email = email.trim().toLowerCase(Locale.ROOT);

        if (repository.existsByEmailIgnoreCase(email)
                && (vendor.getEmail() == null
                    || !vendor.getEmail().equalsIgnoreCase(email))) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Vendor email already exists");
        }
    } else {
        email = null;
    }

    vendor.setName(request.name().trim());
    vendor.setEmail(email);
    vendor.setPhone(
        request.phone() == null || request.phone().isBlank()
            ? null : request.phone().trim()
    );
    vendor.setAddress(
        request.address() == null || request.address().isBlank()
            ? null : request.address().trim()
    );

    return repository.saveAndFlush(vendor);
}

}
