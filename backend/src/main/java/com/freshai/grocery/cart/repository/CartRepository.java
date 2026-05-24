package com.freshai.grocery.cart.repository;

import com.freshai.grocery.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;

public interface CartRepository extends JpaRepository<Cart, Long> {
    @EntityGraph(attributePaths = {"items"})
    Optional<Cart> findByUserId(Long userId);
}
