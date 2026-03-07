package com.freshai.grocery.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String paymentMethod;
    private String notes;
    private String deliverySlotId;
}
