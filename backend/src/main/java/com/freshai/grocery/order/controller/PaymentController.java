package com.freshai.grocery.order.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.order.dto.CreateOrderRequest;
import com.freshai.grocery.order.dto.OrderDTO;
import com.freshai.grocery.order.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = paymentService.createPaymentOrder(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(response, "Payment order created"));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<OrderDTO>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody VerifyPaymentRequest request) {
        
        OrderDTO order = paymentService.verifyPaymentAndCreateOrder(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok(order, "Payment verified and order created"));
    }

    @Data
    public static class VerifyPaymentRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private CreateOrderRequest orderData;
    }
}
