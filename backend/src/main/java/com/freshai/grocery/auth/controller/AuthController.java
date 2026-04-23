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
 * POST /api/auth/login → { accessToken, refreshToken, expiresIn, user }
 * POST /api/auth/register → { accessToken, refreshToken, expiresIn, user }
 * POST /api/auth/refresh → { accessToken, expiresIn }
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final OtpService otpService;

    /* ── LOGIN ─────────────────────────────────────────────────────────── */

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        // Fetch user FIRST so we can check status before authentication
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Account is disabled. Contact support.");
        }

        // Block login if email not yet verified
        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Please verify your email before login");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String accessToken  = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        AuthResponse body = buildAuthResponse(user, accessToken, refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(body, "Login successful"));
    }

    /* ── REGISTER ──────────────────────────────────────────────────────── */

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(
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

        try {
            userRepository.save(user);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new BadRequestException("Email is already registered or invalid data");
        }

        // Always generate & save OTP to DB (critical — must succeed for verification to work)
        System.out.println("[REGISTER] Sending email-verification OTP to: " + user.getEmail());
        try {
            otpService.sendEmailVerificationOtp(user);
            System.out.println("[REGISTER] OTP email dispatch succeeded for: " + user.getEmail());
        } catch (Exception e) {
            // Log but don't fail registration; user can request resend from verify page
            System.err.println("[REGISTER] Failed to send OTP email to " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }

        // Welcome email is always non-critical
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        } catch (Exception ignored) {}

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User registered successfully"));
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

        String email = tokenProvider.getEmailFromToken(refreshToken);
        String accessToken = tokenProvider.generateTokenFromEmail(email);

        Map<String, Object> responseBody = Map.of(
                "accessToken", accessToken,
                "expiresIn", tokenProvider.getExpirationMs());
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
