/**
 * Product Service — Centralised product data logic
 * Wraps the raw productApi with image enrichment transforms.
 */
import { getFeaturedProducts, getCategories, getProduct, searchProducts } from '../api/productApi';
import { getProductImageUrl, getCategoryEmoji } from '../utils/imageUtils';

/**
 * Enrich a raw product from API with an accurate imageUrl.
 */
export function enrichProduct(product) {
  return {
    ...product,
    imageUrl: getProductImageUrl(
      product.name,
      product.categoryName || product.category?.name || '',
      product.imageUrl,
      400,
      400
    ),
  };
}

/**
 * Enrich a raw category with emoji fallback.
 */
export function enrichCategory(category) {
  return {
    ...category,
    emoji: getCategoryEmoji(category.name),
  };
}

export async function loadFeaturedProducts() {
  const res = await getFeaturedProducts();
  return (res.data || []).map(enrichProduct);
}

export async function loadCategories() {
  const res = await getCategories();
  return (res.data || []).map(enrichCategory);
}

export async function loadProductById(id) {
  const res = await getProduct(id);          // correct function name: getProduct
  return enrichProduct(res.data);
}

export async function loadProductSearch(query, page = 0, size = 20) {
  const res = await searchProducts(query, page, size);
  const content = res.data?.content || res.data || [];
  return content.map(enrichProduct);
}
