package com.freshai.grocery.cart.controller;

import com.freshai.grocery.cart.dto.AddToCartRequest;
import com.freshai.grocery.cart.dto.CartDTO;
import com.freshai.grocery.cart.service.CartService;
import com.freshai.grocery.exception.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Shopping cart endpoints — all responses use ApiResponse<T> envelope.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ GET    /api/cart                        → get current cart           │
 * │ POST   /api/cart/items                  → add item to cart           │
 * │ PUT    /api/cart/items/{itemId}         → update item quantity       │
 * │ DELETE /api/cart/items/{itemId}         → remove single item         │
 * │ DELETE /api/cart                        → clear entire cart          │
 * └──────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDTO>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
            cartService.getCart(userDetails.getUsername())
        ));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDTO>> addItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
            cartService.addItem(userDetails.getUsername(), request),
            "Item added to cart"
        ));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO>> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(ApiResponse.ok(
            cartService.updateItemQuantity(userDetails.getUsername(), itemId, quantity),
            quantity <= 0 ? "Item removed from cart" : "Cart updated"
        ));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId) {
        cartService.removeItem(userDetails.getUsername(), itemId);
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("itemId", String.valueOf(itemId), "message", "Item removed from cart.")
        ));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("message", "Cart cleared successfully.")
        ));
    }
}
