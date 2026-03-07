import API from './axios';

export const getProducts = (page = 0, size = 12, sortBy = 'name', direction = 'asc') =>
    API.get(`/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);

export const getProduct = (id) => API.get(`/products/${id}`);
export const searchProducts = (q, page = 0, size = 12) => API.get(`/products/search?q=${q}&page=${page}&size=${size}`);
export const getFeaturedProducts = () => API.get('/products/featured');
export const getSimilarProducts = (id) => API.get(`/products/${id}/similar`);
export const getCategories = () => API.get('/products/categories');
