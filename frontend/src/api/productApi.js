import API from './axios';

export const getProducts = (params = {}) => {
    const { page = 0, size = 12, sortBy = 'name', direction = 'asc', category, search } = params;
    let url = `/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (search)   url += `&search=${encodeURIComponent(search)}`;
    return API.get(url);
};

export const getProduct = (id) => API.get(`/products/${id}`);
export const searchProducts = (q, page = 0, size = 12) => API.get(`/products/search?q=${q}&page=${page}&size=${size}`);
export const getFeaturedProducts = () => API.get('/products/featured');
export const getSimilarProducts = (id) => API.get(`/products/${id}/similar`);
export const getCategories = () => API.get('/products/categories');
