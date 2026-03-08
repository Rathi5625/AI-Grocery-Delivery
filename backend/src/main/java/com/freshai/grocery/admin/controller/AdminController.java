package com.freshai.grocery.admin.controller;

import com.freshai.grocery.order.dto.OrderDTO;
import com.freshai.grocery.order.service.OrderService;
import com.freshai.grocery.product.dto.ProductDTO;
import com.freshai.grocery.product.service.ProductService;
import com.freshai.grocery.order.repository.OrderRepository;
import com.freshai.grocery.product.repository.ProductRepository;
import com.freshai.grocery.user.repository.UserRepository;
import com.freshai.grocery.user.dto.UserDTO;
import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.product.entity.Product;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping({ "/dashboard", "/stats" })
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProducts", productRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("pendingOrders", orderRepository.countPendingOrders());
        stats.put("totalRevenue",
                orderRepository.calculateTotalRevenue() != null ? orderRepository.calculateTotalRevenue() : 0);
        stats.put("totalStock", productRepository.sumTotalStock());
        stats.put("lowStockCount", productRepository.findLowStockProducts(10).size());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/products/low-stock")
    public ResponseEntity<List<ProductDTO>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(productRepository.findLowStockProducts(threshold).stream()
                .map(p -> ProductDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .slug(p.getSlug())
                        .price(p.getPrice())
                        .stockQuantity(p.getStockQuantity())
                        .imageUrl(p.getImageUrl())
                        .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .build())
                .collect(Collectors.toList()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream().map(u -> UserDTO.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .avatarUrl(u.getAvatarUrl())
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        // Just return all products for admin
        return ResponseEntity.ok(productRepository.findAll().stream().map(p -> ProductDTO.builder()
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
                .origin(p.getOrigin())
                .nutritionalInfo(p.getNutritionalInfo())
                .carbonFootprint(p.getCarbonFootprint())
                .freshnessDays(p.getFreshnessDays())
                .build()).collect(Collectors.toList()));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.createProduct(productDTO));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO));
    }

    @PutMapping("/products/{id}/stock")
    public ResponseEntity<ProductDTO> updateProductStock(@PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {
        Integer newStock = payload.get("stockQuantity");
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setStockQuantity(newStock);
        productRepository.save(product);
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
