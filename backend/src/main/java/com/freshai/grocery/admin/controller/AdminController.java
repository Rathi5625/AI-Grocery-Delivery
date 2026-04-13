package com.freshai.grocery.admin.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.order.dto.OrderDTO;
import com.freshai.grocery.order.service.OrderService;
import com.freshai.grocery.product.dto.ProductDTO;
import com.freshai.grocery.product.entity.Product;
import com.freshai.grocery.product.repository.ProductRepository;
import com.freshai.grocery.product.service.ProductService;
import com.freshai.grocery.order.repository.OrderRepository;
import com.freshai.grocery.user.dto.UserDTO;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin-only endpoints — require ROLE_ADMIN JWT claim.
 * All responses use ApiResponse<T> envelope.
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │ GET    /api/admin/dashboard            → KPI metrics                  │
 * │ GET    /api/admin/users                → paginated user list          │
 * │ PATCH  /api/admin/users/{id}/status   → toggle isActive              │
 * │ GET    /api/admin/products             → all products                 │
 * │ POST   /api/admin/products            → create product                │
 * │ PUT    /api/admin/products/{id}       → update product                │
 * │ PUT    /api/admin/products/{id}/stock → update stock qty              │
 * │ DELETE /api/admin/products/{id}       → soft-delete product           │
 * │ GET    /api/admin/products/low-stock  → products below threshold      │
 * │ GET    /api/admin/orders              → paginated order list          │
 * │ PUT    /api/admin/orders/{id}/status  → update order status           │
 * └───────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService     productService;
    private final OrderService       orderService;
    private final OrderRepository    orderRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    // ── DASHBOARD ──────────────────────────────────────────────────────────

    @GetMapping({"/dashboard", "/stats"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProducts",  productRepository.count());
        stats.put("totalUsers",     userRepository.count());
        stats.put("activeUsers",    userRepository.countByIsActive(true));
        stats.put("totalOrders",    orderRepository.count());
        stats.put("pendingOrders",  orderRepository.countPendingOrders());

        var revenue = orderRepository.calculateTotalRevenue();
        stats.put("totalRevenue",   revenue != null ? revenue : 0);
        stats.put("totalStock",     productRepository.sumTotalStock());
        stats.put("lowStockCount",  productRepository.findLowStockProducts(10).size());

        // Order status breakdown for donut chart
        List<Map<String, Object>> ordersByStatus = orderRepository.countOrdersByStatus()
                .stream()
                .map(row -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("status", row[0].toString());
                    entry.put("count",  row[1]);
                    return entry;
                })
                .collect(Collectors.toList());
        stats.put("ordersByStatus", ordersByStatus);

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    // ── USERS ──────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "50")   int size) {

        List<UserDTO> users = userRepository.findAll().stream()
                .map(this::toUserDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDTO>> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok(
            toUserDTO(user),
            "User status updated to " + (user.getIsActive() ? "ACTIVE" : "INACTIVE")
        ));
    }

    // ── PRODUCTS ── ────────────────────────────────────────────────────────

    @GetMapping("/products")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts() {
        // Uses JOIN FETCH so category is eagerly loaded — avoids LazyInitializationException
        List<ProductDTO> products = productRepository.findAllWithCategory().stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/products/low-stock")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {
        // Uses JOIN FETCH so category is eagerly loaded — avoids LazyInitializationException
        List<ProductDTO> products = productRepository.findLowStockWithCategory(threshold).stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(products,
            products.size() + " product(s) below stock threshold of " + threshold));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(ApiResponse.ok(
            productService.createProduct(productDTO), "Product created"
        ));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(ApiResponse.ok(
            productService.updateProduct(id, productDTO), "Product updated"
        ));
    }

    @PutMapping("/products/{id}/stock")
    @Transactional
    public ResponseEntity<ApiResponse<ProductDTO>> updateProductStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {

        Integer newStock = payload.get("stockQuantity");
        if (newStock == null || newStock < 0) {
            throw new BadRequestException("stockQuantity must be a non-negative integer.");
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setStockQuantity(newStock);
        productRepository.save(product);
        return ResponseEntity.ok(ApiResponse.ok(
            productService.getProductById(id),
            "Stock updated to " + newStock
        ));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("id", String.valueOf(id), "message", "Product deleted successfully.")
        ));
    }

    // ── ORDERS ─────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getAllOrders(
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "20")  int size) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders(page, size)));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok(
            orderService.updateOrderStatus(id, status),
            "Order status updated to " + status.toUpperCase()
        ));
    }

    // ── PRIVATE HELPERS ────────────────────────────────────────────────────

    private UserDTO toUserDTO(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .profileImage(u.getProfileImage())   // fixed: was u.getAvatarUrl()
                .isActive(u.getIsActive())
                .emailVerified(u.getEmailVerified())
                .phoneVerified(u.getPhoneVerified())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private ProductDTO toProductDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .unit(p.getUnit())
                .weight(p.getWeight())
                .stockQuantity(p.getStockQuantity())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .sustainabilityScore(p.getSustainabilityScore())
                .isOrganic(p.getIsOrganic())
                .isFeatured(p.getIsFeatured())
                .isActive(p.getIsActive())
                .origin(p.getOrigin())
                .nutritionalInfo(p.getNutritionalInfo())
                .carbonFootprint(p.getCarbonFootprint())
                .freshnessDays(p.getFreshnessDays())
                .build();
    }
}
