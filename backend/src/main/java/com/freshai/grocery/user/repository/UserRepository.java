package com.freshai.grocery.user.repository;

import com.freshai.grocery.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Used by admin dashboard — counts users with isActive = true/false */
    long countByIsActive(boolean isActive);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u " +
           "WHERE (:active IS NULL OR u.isActive = :active) " +
           "AND (:query IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    org.springframework.data.domain.Page<User> searchUsers(
            @org.springframework.data.repository.query.Param("active") Boolean active,
            @org.springframework.data.repository.query.Param("query") String query,
            org.springframework.data.domain.Pageable pageable);
}
