package com.freshai.grocery.product.repository;

import com.freshai.grocery.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByIsActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    List<Product> findByIsOrganicTrueAndIsActiveTrue(Pageable pageable);

    Optional<Product> findBySlug(String slug);

    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.sustainabilityScore DESC")
    List<Product> findTopSustainable(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id != :productId AND p.isActive = true")
    List<Product> findSimilarProducts(@Param("categoryId") Long categoryId, @Param("productId") Long productId,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stockQuantity <= :threshold ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    @Query("SELECT COALESCE(SUM(p.stockQuantity), 0) FROM Product p WHERE p.isActive = true")
    Long sumTotalStock();

    /** Admin: fetch ALL products with category eagerly loaded (avoids LazyInitializationException) */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category ORDER BY p.name ASC")
    List<Product> findAllWithCategory();

    /** Admin: low-stock products with category eagerly loaded */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.isActive = true AND p.stockQuantity <= :threshold ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockWithCategory(@Param("threshold") int threshold);
}
