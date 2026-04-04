import API from './axios';

// ── Admin Dashboard ─────────────────────────────────────────
export const getDashboardStats  = ()            => API.get('/admin/dashboard');

// ── User Management ─────────────────────────────────────────
export const getAllUsers         = (p=0, s=50)  => API.get(`/admin/users?page=${p}&size=${s}`);
export const toggleUserStatus   = (id)          => API.patch(`/admin/users/${id}/status`);

// ── Product Management ──────────────────────────────────────
export const adminGetProducts   = ()            => API.get('/admin/products');
export const adminCreateProduct = (data)        => API.post('/admin/products', data);
export const adminUpdateProduct = (id, data)    => API.put(`/admin/products/${id}`, data);
export const adminDeleteProduct = (id)          => API.delete(`/admin/products/${id}`);
export const adminUpdateStock   = (id, qty)     => API.put(`/admin/products/${id}/stock`, { stockQuantity: qty });
export const getLowStockProducts= (thresh=10)   => API.get(`/admin/products/low-stock?threshold=${thresh}`);

// ── Order Management ────────────────────────────────────────
export const adminGetOrders     = (p=0, s=20)   => API.get(`/admin/orders?page=${p}&size=${s}`);
export const adminUpdateStatus  = (id, status)  => API.put(`/admin/orders/${id}/status?status=${status}`);
