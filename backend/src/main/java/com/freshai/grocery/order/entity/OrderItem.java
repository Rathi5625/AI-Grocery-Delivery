package com.freshai.grocery.order.entity;

import com.freshai.grocery.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Snapshot of a product at time of purchase.
 *
 * productName, productImage, unit are stored as snapshots so that:
 * - Admins can see what the customer ordered even if the product is later renamed/deleted
 * - The DTO never NPEs when loading old orders
 *
 * product FK is kept as NULLABLE so we don't lose order history if a product is hard-deleted.
 */
@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** Nullable: product may be soft-deleted after order is placed */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true)
    private Product product;

    // ── Snapshots (copied at order creation, never change) ────────────────

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "product_image", length = 500)
    private String productImage;

    @Column(name = "unit", length = 50)
    private String unit;

    // ── Financials ────────────────────────────────────────────────────────

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
