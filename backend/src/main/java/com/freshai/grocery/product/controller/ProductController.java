package com.freshai.grocery.product.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.product.dto.*;
import com.freshai.grocery.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class ProductController {

    private final ProductService productService;

    /** GET /api/products?page=0&size=12&sortBy=name&direction=asc */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAllProducts(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "12")   int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc")  String direction) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllProducts(page, size, sortBy, direction)));
    }

    /** GET /api/products/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(id)));
    }

    /** GET /api/products/slug/{slug} */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductBySlug(slug)));
    }

    /** GET /api/products/category/{id}?page=0&size=12  — was missing, caused frontend 404 */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductsByCategory(categoryId, page, size)));
    }

    /** GET /api/products/search?q=apple&page=0&size=12 */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.ok(productService.searchProducts(q, page, size)));
    }

    /** GET /api/products/featured */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getFeaturedProducts() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFeaturedProducts()));
    }

    /** GET /api/products/{id}/similar */
    @GetMapping("/{id}/similar")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getSimilarProducts(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getSimilarProducts(id)));
    }

    /** GET /api/products/categories */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllCategories()));
    }
}

