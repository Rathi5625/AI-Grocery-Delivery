package com.freshai.grocery.product.repository;

import com.freshai.grocery.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActiveTrueOrderBySortOrder();

    @Query("SELECT c FROM Category c WHERE c.isActive = true ORDER BY c.sortOrder ASC")
    List<Category> findTopLevelActive();

    Optional<Category> findBySlug(String slug);
}
