package com.freshai.grocery.order.repository;

import com.freshai.grocery.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    /** Fixed: use enum constant in JPQL, not raw string literal */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = com.freshai.grocery.order.entity.Order.OrderStatus.PENDING")
    long countPendingOrders();

    /** Fixed: exclude CANCELLED and REFUNDED orders from revenue */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status NOT IN " +
           "(com.freshai.grocery.order.entity.Order.OrderStatus.CANCELLED, " +
           "com.freshai.grocery.order.entity.Order.OrderStatus.REFUNDED)")
    BigDecimal calculateTotalRevenue();

    /** Revenue grouped by day for chart (last 30 days) */
    @Query("SELECT DATE(o.createdAt) as day, SUM(o.totalAmount) as revenue " +
           "FROM Order o WHERE o.status NOT IN " +
           "(com.freshai.grocery.order.entity.Order.OrderStatus.CANCELLED, " +
           "com.freshai.grocery.order.entity.Order.OrderStatus.REFUNDED) " +
           "AND o.createdAt >= CURRENT_DATE - 30 " +
           "GROUP BY DATE(o.createdAt) ORDER BY day DESC")
    List<Object[]> getDailyRevenueLast30Days();

    /** Count orders by each status — for admin dashboard donut chart */
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    /** All orders for a user — for order history page */
    Page<Order> findByUserOrderByCreatedAtDesc(
            @Param("user") com.freshai.grocery.user.entity.User user, Pageable pageable);
}
