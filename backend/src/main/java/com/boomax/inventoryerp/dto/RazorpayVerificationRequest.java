
package com.boomax.inventoryerp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RazorpayVerificationRequest {

    @NotBlank
    @Size(max = 100)
    private String razorpayOrderId;

    @NotBlank
    @Size(max = 100)
    private String razorpayPaymentId;

    @NotBlank
    @Size(max = 256)
    private String razorpaySignature;

    public RazorpayVerificationRequest() {
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }
}
