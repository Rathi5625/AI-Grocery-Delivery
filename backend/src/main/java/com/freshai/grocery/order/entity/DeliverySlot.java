package com.freshai.grocery.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "delivery_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliverySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Column(name = "max_orders")
    @Builder.Default
    private Integer maxOrders = 20;

    @Column(name = "current_orders")
    @Builder.Default
    private Integer currentOrders = 0;

    public enum SlotStatus {
        AVAILABLE, FULL, BLOCKED
    }
}
