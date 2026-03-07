package com.freshai.grocery.cart.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {
    private Long id;
    private BigDecimal totalAmount;
    private List<CartItemDTO> items;
    private int itemCount;
}
