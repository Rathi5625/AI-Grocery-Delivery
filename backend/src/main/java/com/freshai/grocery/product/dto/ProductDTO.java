package com.freshai.grocery.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDTO {
    private Long       id;
    private String     name;
    private String     slug;
    private String     description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String     unit;
    private BigDecimal weight;
    private Integer    stockQuantity;
    private String     imageUrl;
    private Long       categoryId;
    private String     categoryName;
    private BigDecimal sustainabilityScore;
    private Boolean    isOrganic;
    private Boolean    isFeatured;
    private Boolean    isActive;        // added: for admin panel visibility control
    private String     origin;
    private String     nutritionalInfo;
    private BigDecimal carbonFootprint;
    private Integer    freshnessDays;
}
