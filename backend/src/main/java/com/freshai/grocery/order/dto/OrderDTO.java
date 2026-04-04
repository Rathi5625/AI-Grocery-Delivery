package com.freshai.grocery.order.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDTO {
    private Long              id;
    private String            orderNumber;
    private Long              userId;
    private String            userEmail;      // for admin view
    private BigDecimal        subtotal;
    private BigDecimal        deliveryFee;
    private BigDecimal        discountAmount;
    private BigDecimal        totalAmount;
    private String            status;
    private String            paymentMethod;
    private String            paymentStatus;
    private String            deliveryAddress;
    private String            notes;
    private BigDecimal        carbonSaved;
    private List<OrderItemDTO> items;
    private LocalDateTime     createdAt;
    private LocalDateTime     updatedAt;
}
