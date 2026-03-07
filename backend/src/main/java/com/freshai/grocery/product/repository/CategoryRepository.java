package com.freshai.grocery.product.repository;

import com.freshai.grocery.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActiveTrueOrderBySortOrder();

    List<Category> findByParentIsNullAndIsActiveTrue();

    Optional<Category> findBySlug(String slug);
}
