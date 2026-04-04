package com.freshai.grocery.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {

    private Long id;

    @NotBlank
    private String label;

    @NotBlank
    private String fullAddress;

    private String city;
    private String pincode;
    private Boolean isDefault;
}
