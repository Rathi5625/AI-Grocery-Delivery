import API from './axios';

export const createOrder = (data) => API.post('/orders', data);
export const getOrders = (page = 0, size = 10) => API.get(`/orders?page=${page}&size=${size}`);
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
