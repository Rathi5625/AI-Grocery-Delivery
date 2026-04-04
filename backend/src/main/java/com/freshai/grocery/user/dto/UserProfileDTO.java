package com.freshai.grocery.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.freshai.grocery.order.dto.OrderDTO;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileDTO {

    private Long    id;
    private String  firstName;
    private String  lastName;
    private String  email;
    private String  phone;
    private String  role;

    /** Renamed from avatarUrl to match the schema column profile_image */
    private String  profileImage;

    /** Whether the user has verified their email address */
    private Boolean emailVerified;

    /** Whether the user has verified their phone number */
    private Boolean phoneVerified;

    private LocalDateTime     createdAt;
    private List<AddressDTO>  addresses;
    private List<OrderDTO>    recentOrders;
}
