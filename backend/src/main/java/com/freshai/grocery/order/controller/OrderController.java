package com.freshai.grocery.order.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.order.dto.CreateOrderRequest;
import com.freshai.grocery.order.dto.OrderDTO;
import com.freshai.grocery.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * User-facing order endpoints — all responses use ApiResponse<T> envelope.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ POST  /api/orders             → place order from current cart        │
 * │ GET   /api/orders             → get paginated order history          │
 * │ GET   /api/orders/{id}        → get full order details               │
 * │ PUT   /api/orders/{id}/cancel → cancel a PENDING/CONFIRMED order     │
 * └──────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** Place a new order from the current cart */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDTO order = orderService.createOrder(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(order, "Order placed! Your order number is " + order.getOrderNumber()));
    }

    /** Get paginated order history for current user */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
            orderService.getUserOrders(userDetails.getUsername(), page, size)
        ));
    }

    /** Get full order details including all items */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
            orderService.getOrderById(id, userDetails.getUsername())
        ));
    }

    /** Cancel a PENDING or CONFIRMED order */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
            orderService.cancelOrder(id, userDetails.getUsername()),
            "Order cancelled successfully."
        ));
    }
}
