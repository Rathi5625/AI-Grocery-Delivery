package com.freshai.grocery.auth.controller;

import com.freshai.grocery.auth.dto.*;
import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.notification.email.EmailService;
import com.freshai.grocery.otp.service.OtpService;
import com.freshai.grocery.security.JwtTokenProvider;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication endpoints — all responses use ApiResponse<T> envelope.
 *
 * POST /api/auth/login    → { accessToken, refreshToken, expiresIn, user }
 * POST /api/auth/register → { accessToken, refreshToken, expiresIn, user }
 * POST /api/auth/refresh  → { accessToken, expiresIn }
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtTokenProvider      tokenProvider;
    private final EmailService          emailService;
    private final OtpService            otpService;

    /* ── LOGIN ─────────────────────────────────────────────────────────── */

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Account is disabled. Contact support.");
        }

        String accessToken  = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        AuthResponse body = buildAuthResponse(user, accessToken, refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(body, "Login successful"));
    }

    /* ── REGISTER ──────────────────────────────────────────────────────── */

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Validate passwords match (if confirmPassword field is present)
        if (request.getConfirmPassword() != null &&
                !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        userRepository.save(user);

        // Send welcome email (non-critical — failure is logged but doesn't block response)
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        // Send email-verification OTP so user can prove email ownership
        otpService.sendEmailVerificationOtp(user);

        String accessToken  = tokenProvider.generateTokenFromEmail(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        AuthResponse body = buildAuthResponse(user, accessToken, refreshToken);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(body, "Registration successful. Check your email to verify your account."));
    }

    /* ── REFRESH TOKEN ─────────────────────────────────────────────────── */

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refreshToken(
            @RequestBody Map<String, String> payload) {

        String refreshToken = payload.get("refreshToken");

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Refresh token is expired or invalid");
        }
        if (!tokenProvider.isRefreshToken(refreshToken)) {
            throw new BadRequestException("Provided token is not a refresh token");
        }

        String email       = tokenProvider.getEmailFromToken(refreshToken);
        String accessToken = tokenProvider.generateTokenFromEmail(email);

        Map<String, Object> responseBody = Map.of(
                "accessToken", accessToken,
                "expiresIn",   tokenProvider.getExpirationMs()
        );
        return ResponseEntity.ok(ApiResponse.ok(responseBody, "Token refreshed"));
    }

    /* ── Helpers ───────────────────────────────────────────────────────── */

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .phone(user.getPhone())
                        .role(user.getRole().name())
                        .profileImage(user.getProfileImage())
                        .emailVerified(user.getEmailVerified())
                        .phoneVerified(user.getPhoneVerified())
                        .build())
                .build();
    }
}
