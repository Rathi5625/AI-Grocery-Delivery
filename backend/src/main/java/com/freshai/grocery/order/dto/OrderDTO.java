package com.freshai.grocery.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private String deliveryAddress;
    private String notes;
    private BigDecimal carbonSaved;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
}
