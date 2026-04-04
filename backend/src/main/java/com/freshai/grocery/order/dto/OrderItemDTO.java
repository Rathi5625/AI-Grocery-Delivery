package com.freshai.grocery.order.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderItemDTO {
    private Long       id;
    private Long       productId;
    private String     productName;
    private String     productImage;
    private String     productUnit;
    private Integer    quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
