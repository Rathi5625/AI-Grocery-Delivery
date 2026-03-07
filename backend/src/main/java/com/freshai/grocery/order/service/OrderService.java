package com.freshai.grocery.order.service;

import com.freshai.grocery.cart.entity.*;
import com.freshai.grocery.cart.repository.CartRepository;
import com.freshai.grocery.exception.*;
import com.freshai.grocery.order.dto.*;
import com.freshai.grocery.order.entity.*;
import com.freshai.grocery.order.repository.OrderRepository;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDTO createOrder(String email, CreateOrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .subtotal(cart.getTotalAmount())
                .deliveryFee(new BigDecimal("2.99"))
                .totalAmount(cart.getTotalAmount().add(new BigDecimal("2.99")))
                .deliveryAddress(request.getDeliveryAddress())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD")
                .notes(request.getNotes())
                .build();

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .totalPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            order.getOrderItems().add(orderItem);
        }

        BigDecimal carbonSaved = order.getOrderItems().stream()
                .filter(item -> item.getProduct().getCarbonFootprint() != null)
                .map(item -> item.getProduct().getCarbonFootprint().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setCarbonSaved(carbonSaved);

        Order savedOrder = orderRepository.save(order);

        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        return toDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getUserOrders(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id, String email) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getEmail().equals(email)) {
            throw new BadRequestException("Access denied");
        }
        return toDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id, String email) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getEmail().equals(email)) {
            throw new BadRequestException("Access denied");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in current status");
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        return toDTO(orderRepository.save(order));
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        return toDTO(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size)).map(this::toDTO);
    }

    private OrderDTO toDTO(Order o) {
        return OrderDTO.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
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
                .items(o.getOrderItems().stream().map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImage(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
