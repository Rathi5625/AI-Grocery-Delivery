import API from './axios';

// ── Cart ─────────────────────────────────────────────────────
export const getCart            = ()                    => API.get('/cart');
export const addToCart          = (productId, quantity) => API.post('/cart/items', { productId, quantity });
export const updateCartItem     = (itemId, quantity)    => API.put(`/cart/items/${itemId}?quantity=${quantity}`);
export const removeCartItem     = (itemId)              => API.delete(`/cart/items/${itemId}`);
export const clearCart          = ()                    => API.delete('/cart');
