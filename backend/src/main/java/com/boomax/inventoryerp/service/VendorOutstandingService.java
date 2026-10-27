
package com.boomax.inventoryerp.service;

import com.boomax.inventoryerp.dto.VendorOutstandingResponse;
import com.boomax.inventoryerp.entity.Vendor;
import com.boomax.inventoryerp.repository.PurchaseOrderRepository;
import com.boomax.inventoryerp.repository.VendorPaymentRepository;
import com.boomax.inventoryerp.repository.VendorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VendorOutstandingService {

    private final VendorRepository vendorRepository;
    private final PurchaseOrderRepository orderRepository;
    private final VendorPaymentRepository paymentRepository;

    public VendorOutstandingService(
            VendorRepository vendorRepository,
            PurchaseOrderRepository orderRepository,
            VendorPaymentRepository paymentRepository) {
        this.vendorRepository = vendorRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<VendorOutstandingResponse> getAll() {
        return vendorRepository.findAll()
                .stream()
                .map(vendor -> calculate(vendor))
                .toList();
    }

    @Transactional(readOnly = true)
    public VendorOutstandingResponse getByVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vendor not found"));

        return calculate(vendor);
    }

    private VendorOutstandingResponse calculate(Vendor vendor) {
        BigDecimal totalPurchases =
                orderRepository.sumOrderTotalByVendorId(vendor.getId());

        BigDecimal totalPaid =
                paymentRepository.sumPaymentsByVendorId(vendor.getId());

        BigDecimal outstanding = totalPurchases.subtract(totalPaid);

        return new VendorOutstandingResponse(
                vendor.getId(),
                vendor.getName(),
                totalPurchases,
                totalPaid,
                outstanding
        );
    }
}
