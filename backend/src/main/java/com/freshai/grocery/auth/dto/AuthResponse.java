package com.freshai.grocery.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String accessToken;
    private String refreshToken;      // added for token refresh flow
    private String tokenType;
    private Long   expiresIn;
    private UserInfo user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UserInfo {
        private Long    id;
        private String  email;
        private String  firstName;
        private String  lastName;
        private String  phone;
        private String  role;
        private String  profileImage;
        private Boolean emailVerified;
        private Boolean phoneVerified;
    }
}
