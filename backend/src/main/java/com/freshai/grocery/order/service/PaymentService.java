package com.freshai.grocery.order.service;

import com.freshai.grocery.cart.entity.Cart;
import com.freshai.grocery.cart.entity.CartItem;
import com.freshai.grocery.cart.repository.CartRepository;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.order.controller.PaymentController.VerifyPaymentRequest;
import com.freshai.grocery.order.dto.OrderDTO;
import com.freshai.grocery.order.entity.Order;
import com.freshai.grocery.order.entity.Payment;
import com.freshai.grocery.order.repository.OrderRepository;
import com.freshai.grocery.order.repository.PaymentRepository;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final String razorpayKeyId;
    private final String razorpayKeySecret;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    private static final BigDecimal DELIVERY_FEE = new BigDecimal("49.00");
    private static final BigDecimal FREE_DELIVERY_MIN = new BigDecimal("500.00");

    public PaymentService(
            @Value("${app.razorpay.key-id}") String razorpayKeyId,
            @Value("${app.razorpay.key-secret}") String razorpayKeySecret,
            CartRepository cartRepository,
            UserRepository userRepository,
            OrderService orderService,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository) {
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    public Map<String, Object> createPaymentOrder(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subtotal = cart.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        // Assume no discount initially for payment calculation (or we should pass discount if needed)
        BigDecimal discount = BigDecimal.ZERO;

        BigDecimal deliveryFee = subtotal.subtract(discount).compareTo(FREE_DELIVERY_MIN) >= 0
                ? BigDecimal.ZERO : DELIVERY_FEE;

        BigDecimal total = subtotal.subtract(discount).add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        // Convert total to paise (integer)
        int amountInPaise = total.multiply(new BigDecimal("100")).intValue();

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", razorpayOrder.get("id"));
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            response.put("keyId", razorpayKeyId);

            return response;
        } catch (Exception e) {
            throw new BadRequestException("Error creating payment order: " + e.getMessage());
        }
    }

    @Transactional
    public OrderDTO verifyPaymentAndCreateOrder(String email, VerifyPaymentRequest request) {
        try {
            // 1. Verify signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                throw new BadRequestException("Payment signature verification failed");
            }

            // 2. Signature valid, create order
            // Note: orderService.createOrder clears the cart
            OrderDTO orderDto = orderService.createOrder(email, request.getOrderData());

            // 3. Update order payment details
            Order order = orderRepository.findById(orderDto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found after creation"));

            order.setPaymentId(request.getRazorpayPaymentId());
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setPaymentMethod("ONLINE");
            orderRepository.save(order);

            // 4. Save Payment record
            Payment paymentRecord = Payment.builder()
                    .user(order.getUser())
                    .order(order)
                    .paymentId(request.getRazorpayPaymentId())
                    .amount(order.getTotalAmount())
                    .status("SUCCESS")
                    .build();
            paymentRepository.save(paymentRecord);

            // Re-fetch or return updated DTO
            return orderService.toDTO(order, true);
        } catch (Exception e) {
            throw new BadRequestException("Payment verification error: " + e.getMessage());
        }
    }
}
