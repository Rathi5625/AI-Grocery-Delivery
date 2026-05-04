import API from './axios';

// ── Admin Dashboard ─────────────────────────────────────────
export const getDashboardStats = () => API.get('/admin/dashboard');
export const getRevenueStats = (range = '7days') => API.get(`/admin/revenue?range=${range}`);
export const getOrdersDensity = () => API.get('/admin/orders-density');

// ── User Management ───────────────────────────────────────
export const adminGetUsers    = (params) => API.get('/admin/users', { params });
export const toggleUserStatus = (id) => API.patch(`/admin/users/${id}/status`);
export const adminCreateUser  = (data) => API.post('/admin/users', data);
export const adminUpdateUser  = (id, data) => API.put(`/admin/users/${id}`, data);

// ── Product Management ──────────────────────────────────────
export const adminGetProducts    = (search) => API.get(`/admin/products${search ? `?search=${search}` : ''}`);
export const adminCreateProduct  = (data) => API.post('/admin/products', data);
export const adminUpdateProduct  = (id, data) => API.put(`/admin/products/${id}`, data);
export const adminDeleteProduct  = (id) => API.delete(`/admin/products/${id}`);
export const adminUpdateStock    = (id, qty) => API.put(`/admin/products/${id}/stock`, { stockQuantity: qty });
export const getLowStockProducts = (thresh = 10) => API.get(`/admin/products/low-stock?threshold=${thresh}`);

// ── Inventory Management ─────────────────────────────────
export const adminGetInventory      = (params) => API.get('/admin/inventory', { params });
export const adminGetInventoryStats = () => API.get('/admin/inventory/stats');
export const adminReorderProduct    = (id, quantity) => API.post(`/admin/inventory/reorder/${id}`, { quantity });
export const adminExportInventory   = () => API.get('/admin/inventory/export', { responseType: 'blob' });

// ── Order Management ────────────────────────────────────────
export const adminGetOrders      = (params) => API.get('/admin/orders', { params });
export const adminGetOrderStats  = ()       => API.get('/admin/orders/stats');
export const adminPatchStatus    = (id, status) => API.patch(`/admin/orders/${id}/status`, { status });
export const adminUpdateStatus   = (id, status) => API.put(`/admin/orders/${id}/status?status=${status}`);
