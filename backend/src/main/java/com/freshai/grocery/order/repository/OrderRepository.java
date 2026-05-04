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

    long countByCreatedAtAfter(LocalDateTime since);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    long countByStatus(Order.OrderStatus status);

    default long countPendingOrders() {
        return countByStatus(Order.OrderStatus.PENDING);
    }

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status NOT IN (:excludedStatuses)")
    BigDecimal calculateTotalRevenueWithExclusions(@Param("excludedStatuses") List<Order.OrderStatus> excludedStatuses);

    default BigDecimal calculateTotalRevenue() {
        return calculateTotalRevenueWithExclusions(
            List.of(Order.OrderStatus.CANCELLED, Order.OrderStatus.REFUNDED)
        );
    }

    @Query(value = "SELECT DATE(o.created_at) as day, SUM(o.total_amount) as revenue " +
                   "FROM orders o " +
                   "WHERE o.status NOT IN ('CANCELLED', 'REFUNDED') " +
                   "AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
                   "GROUP BY DATE(o.created_at) ORDER BY day ASC",
           nativeQuery = true)
    List<Object[]> getDailyRevenueLast7Days();

    @Query(value = "SELECT DATE(o.created_at) as day, COUNT(o.id) as count " +
                   "FROM orders o " +
                   "WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
                   "GROUP BY DATE(o.created_at) ORDER BY day ASC",
           nativeQuery = true)
    List<Object[]> getDailyOrdersLast7Days();

    // Fixed: count by status — works fine with GROUP BY
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    // All orders for a user — for order history page
    @Query("SELECT o FROM Order o WHERE o.user = :user ORDER BY o.createdAt DESC")
    Page<Order> findByUserOrderByCreatedAtDesc(
            @Param("user") com.freshai.grocery.user.entity.User user, Pageable pageable);

    @Query("SELECT o FROM Order o " +
           "WHERE (:status IS NULL OR o.status = :status) " +
           "AND (:query IS NULL OR " +
           "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.user.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.user.lastName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Order> searchOrders(@Param("status") Order.OrderStatus status, 
                             @Param("query") String query, 
                             Pageable pageable);
}
