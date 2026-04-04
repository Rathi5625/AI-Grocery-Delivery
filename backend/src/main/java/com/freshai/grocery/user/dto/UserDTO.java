package com.freshai.grocery.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Compact user representation for admin lists and public-facing references.
 * Does NOT include sensitive fields (passwordHash, etc.).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {
    private Long           id;
    private String         email;
    private String         firstName;
    private String         lastName;
    private String         phone;
    private String         role;

    /** Renamed from avatarUrl to match schema column profile_image */
    private String         profileImage;

    private Boolean        isActive;
    private Boolean        emailVerified;
    private Boolean        phoneVerified;
    private LocalDateTime  createdAt;
}
