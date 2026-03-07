package com.freshai.grocery.cart.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String productUnit;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
