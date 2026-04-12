package com.freshai.grocery.order.repository;

import com.freshai.grocery.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    // Fixed: Use string literal comparison for @Enumerated(EnumType.STRING) fields
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PENDING'")
    long countPendingOrders();

    // Fixed: exclude CANCELLED and REFUNDED using string literals
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')")
    BigDecimal calculateTotalRevenue();

    // Fixed: use native SQL for DATE() and date arithmetic — HQL doesn't support these
    @Query(value = "SELECT DATE(o.created_at) as day, SUM(o.total_amount) as revenue " +
                   "FROM orders o " +
                   "WHERE o.status NOT IN ('CANCELLED', 'REFUNDED') " +
                   "AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) " +
                   "GROUP BY DATE(o.created_at) ORDER BY day DESC",
           nativeQuery = true)
    List<Object[]> getDailyRevenueLast30Days();

    // Fixed: count by status — works fine with GROUP BY
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    // All orders for a user — for order history page
    @Query("SELECT o FROM Order o WHERE o.user = :user ORDER BY o.createdAt DESC")
    Page<Order> findByUserOrderByCreatedAtDesc(
            @Param("user") com.freshai.grocery.user.entity.User user, Pageable pageable);
}
