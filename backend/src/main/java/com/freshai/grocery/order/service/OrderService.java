package com.freshai.grocery.order.service;

import com.freshai.grocery.cart.entity.Cart;
import com.freshai.grocery.cart.entity.CartItem;
import com.freshai.grocery.cart.repository.CartRepository;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.order.dto.CreateOrderRequest;
import com.freshai.grocery.order.dto.OrderDTO;
import com.freshai.grocery.order.dto.OrderItemDTO;
import com.freshai.grocery.order.entity.Order;
import com.freshai.grocery.order.entity.OrderItem;
import com.freshai.grocery.order.repository.OrderRepository;
import com.freshai.grocery.product.entity.Product;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    /** Flat delivery fee INR — make configurable via application.yml if needed */
    private static final BigDecimal DELIVERY_FEE      = new BigDecimal("49.00");
    /** Free delivery threshold */
    private static final BigDecimal FREE_DELIVERY_MIN = new BigDecimal("500.00");

    private final OrderRepository orderRepository;
    private final CartRepository  cartRepository;
    private final UserRepository  userRepository;

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE ORDER
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public OrderDTO createOrder(String email, CreateOrderRequest request) {
        User user = findUser(email);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty. Add items before placing an order."));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty. Add items before placing an order.");
        }

        // ── Validate stock for all items before committing ─────────────────
        for (CartItem item : cart.getItems()) {
            Product p = item.getProduct();
            if (!p.getIsActive()) {
                throw new BadRequestException(
                    "Product '" + p.getName() + "' is no longer available.");
            }
            if (p.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException(
                    "Insufficient stock for '" + p.getName() +
                    "'. Available: " + p.getStockQuantity());
            }
        }

        // ── Calculate totals ────────────────────────────────────────────────
        BigDecimal subtotal = cart.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal discount = BigDecimal.ZERO;
        if (request.getDiscountAmount() != null && request.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            // Validate discount doesn't exceed subtotal
            discount = request.getDiscountAmount().min(subtotal).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal deliveryFee = subtotal.subtract(discount).compareTo(FREE_DELIVERY_MIN) >= 0
                ? BigDecimal.ZERO : DELIVERY_FEE;

        BigDecimal total = subtotal.subtract(discount).add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        // ── Build the order ─────────────────────────────────────────────────
        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod().toUpperCase() : "COD";

        Order order = Order.builder()
                .user(user)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .discountAmount(discount)
                .totalAmount(total)
                .deliveryAddress(request.getDeliveryAddress())
                .paymentMethod(paymentMethod)
                .notes(request.getNotes())
                .build();

        // ── Attach order items + calculate carbon saved ──────────────────────
        BigDecimal carbonSaved = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Product p = cartItem.getProduct();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .productName(p.getName())
                    .productImage(p.getImageUrl())
                    .unit(p.getUnit())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .totalPrice(cartItem.getUnitPrice()
                            .multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                            .setScale(2, RoundingMode.HALF_UP))
                    .build();

            order.getOrderItems().add(orderItem);

            // Deduct stock
            p.setStockQuantity(p.getStockQuantity() - cartItem.getQuantity());

            if (p.getCarbonFootprint() != null) {
                carbonSaved = carbonSaved.add(
                    p.getCarbonFootprint().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            }
        }
        order.setCarbonSaved(carbonSaved.setScale(2, RoundingMode.HALF_UP));

        Order savedOrder = orderRepository.save(order);

        // ── Clear cart after successful order ────────────────────────────────
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        log.info("Order created: orderId={} userId={} total={}", savedOrder.getId(), user.getId(), total);
        return toDTO(savedOrder, true);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // USER ORDER QUERIES
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Page<OrderDTO> getUserOrders(String email, int page, int size) {
        User user = findUser(email);
        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(o -> toDTO(o, false));
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id, String email) {
        Order order = findOrder(id);
        if (!order.getUser().getEmail().equals(email)) {
            throw new BadRequestException("Access denied.");
        }
        return toDTO(order, true);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id, String email) {
        Order order = findOrder(id);
        if (!order.getUser().getEmail().equals(email)) {
            throw new BadRequestException("Access denied.");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING &&
            order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new BadRequestException(
                "Cannot cancel an order in '" + order.getStatus() + "' status. " +
                "Only PENDING or CONFIRMED orders can be cancelled.");
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        log.info("Order cancelled: orderId={} userId={}", id, order.getUser().getId());
        return toDTO(orderRepository.save(order), true);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN ORDER OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(int page, int size) {
        return orderRepository
                .findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(o -> toDTO(o, true));
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = findOrder(id);
        Order.OrderStatus newStatus;
        try {
            newStatus = Order.OrderStatus.valueOf(status.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                "Invalid order status '" + status + "'. Valid values: " +
                java.util.Arrays.stream(Order.OrderStatus.values())
                    .map(Enum::name).collect(Collectors.joining(", ")));
        }
        order.setStatus(newStatus);
        log.info("Order status updated: orderId={} status={}", id, newStatus);
        return toDTO(orderRepository.save(order), true);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DTO MAPPING
    // ═══════════════════════════════════════════════════════════════════════

    public OrderDTO toDTO(Order o, boolean includeItems) {
        OrderDTO.OrderDTOBuilder builder = OrderDTO.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .userId(o.getUser() != null ? o.getUser().getId() : null)
                .userEmail(o.getUser() != null ? o.getUser().getEmail() : null)
                .subtotal(o.getSubtotal())
                .deliveryFee(o.getDeliveryFee())
                .discountAmount(o.getDiscountAmount())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus().name())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus().name())
                .deliveryAddress(o.getDeliveryAddress())
                .notes(o.getNotes())
                .carbonSaved(o.getCarbonSaved())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt());

        if (includeItems && o.getOrderItems() != null) {
            builder.items(o.getOrderItems().stream().map(item -> {
                Product p = item.getProduct();
                return OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(p != null ? p.getId() : null)
                        .productName(item.getProductName())     // use snapshot — not p.getName()
                        .productImage(item.getProductImage())   // snapshot
                        .productUnit(item.getUnit())            // snapshot
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build();
            }).collect(Collectors.toList()));
        }

        return builder.build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }
}
