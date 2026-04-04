package com.freshai.grocery.product.service;

import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.product.dto.CategoryDTO;
import com.freshai.grocery.product.dto.ProductDTO;
import com.freshai.grocery.product.entity.Category;
import com.freshai.grocery.product.entity.Product;
import com.freshai.grocery.product.repository.CategoryRepository;
import com.freshai.grocery.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductDTO> getAllProducts(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findByIsActiveTrue(pageable).map(this::toDTO);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toDTO(product);
    }

    public ProductDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + slug));
        return toDTO(product);
    }

    public Page<ProductDTO> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable).map(this::toDTO);
    }

    public Page<ProductDTO> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchProducts(query, pageable).map(this::toDTO);
    }

    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getSimilarProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productRepository.findSimilarProducts(product.getCategory().getId(), productId, PageRequest.of(0, 6))
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrder()
                .stream().map(this::toCategoryDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = new Product();
        mapDtoToEntity(dto, product);
        return toDTO(productRepository.save(product));
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        mapDtoToEntity(dto, product);
        return toDTO(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    private ProductDTO toDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .unit(p.getUnit())
                .weight(p.getWeight())
                .stockQuantity(p.getStockQuantity())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .sustainabilityScore(p.getSustainabilityScore())
                .isOrganic(p.getIsOrganic())
                .isFeatured(p.getIsFeatured())
                .isActive(p.getIsActive())
                .origin(p.getOrigin())
                .nutritionalInfo(p.getNutritionalInfo())
                .carbonFootprint(p.getCarbonFootprint())
                .freshnessDays(p.getFreshnessDays())
                .build();
    }

    private CategoryDTO toCategoryDTO(Category c) {
        return CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .sortOrder(c.getSortOrder())
                .build();
    }

    private void mapDtoToEntity(ProductDTO dto, Product product) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setUnit(dto.getUnit());
        product.setWeight(dto.getWeight());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setSustainabilityScore(dto.getSustainabilityScore());
        product.setIsOrganic(dto.getIsOrganic());
        product.setIsFeatured(dto.getIsFeatured());
        if (dto.getIsActive() != null) product.setIsActive(dto.getIsActive());
        product.setOrigin(dto.getOrigin());
        product.setNutritionalInfo(dto.getNutritionalInfo());
        product.setCarbonFootprint(dto.getCarbonFootprint());
        product.setFreshnessDays(dto.getFreshnessDays());
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }
    }
}
