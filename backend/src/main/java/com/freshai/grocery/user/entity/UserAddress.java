package com.freshai.grocery.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "label", length = 30)
    @Builder.Default
    private String label = "Home";   // Home | Work | Other

    @Column(name = "full_address", nullable = false, columnDefinition = "TEXT")
    private String fullAddress;

    @Column(length = 100)
    private String city;

    @Column(length = 10)
    private String pincode;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;
}
