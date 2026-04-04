package com.freshai.grocery.order.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    /**
     * Payment method: COD | ONLINE | WALLET
     * Defaults to COD if not specified.
     */
    private String paymentMethod;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    /** Optional coupon code for discount calculation */
    private String couponCode;

    /** Optional: pre-agreed discount amount (validated server-side) */
    private java.math.BigDecimal discountAmount;
}
