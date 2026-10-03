import api from './api';

export const adminService = {
  // Dashboard & Analytics
  async getDashboardStats() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  // Products
  async createProduct(productData) {
    const res = await api.post('/products', productData);
    return res.data;
  },

  async updateProduct(id, productData) {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  async deleteProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  async uploadImages(formData) {
    const res = await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Categories
  async createCategory(categoryData) {
    const res = await api.post('/categories', categoryData);
    return res.data;
  },

  async updateCategory(id, categoryData) {
    const res = await api.put(`/categories/${id}`, categoryData);
    return res.data;
  },

  async deleteCategory(id) {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },

  // Orders
  async getAllOrders(params = {}) {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  async updateOrderStatus(id, status, note) {
    const res = await api.put(`/orders/${id}/status`, { status, note });
    return res.data;
  },

  async updateOrderTracking(id, trackingNumber, courierName) {
    const res = await api.put(`/orders/${id}/tracking`, { trackingNumber, courierName });
    return res.data;
  },

  // Users
  async getAllUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUserRole(id, role) {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  async toggleUserStatus(id) {
    const res = await api.put(`/admin/users/${id}/status`);
    return res.data;
  },

  // Coupons
  async getAllCoupons() {
    const res = await api.get('/coupons');
    return res.data;
  },

  async createCoupon(data) {
    const res = await api.post('/coupons', data);
    return res.data;
  },

  async updateCoupon(id, data) {
    const res = await api.put(`/coupons/${id}`, data);
    return res.data;
  },

  async deleteCoupon(id) {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
  },

  // Reviews
  async getAllReviews() {
    const res = await api.get('/reviews/admin');
    return res.data;
  },

  async toggleReviewApproval(id) {
    const res = await api.put(`/reviews/${id}/approve`);
    return res.data;
  },

  async deleteReview(id) {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },

  // Banners
  async getAllBanners() {
    const res = await api.get('/banners/admin');
    return res.data;
  },

  async createBanner(data) {
    const res = await api.post('/banners', data);
    return res.data;
  },

  async updateBanner(id, data) {
    const res = await api.put(`/banners/${id}`, data);
    return res.data;
  },

  async deleteBanner(id) {
    const res = await api.delete(`/banners/${id}`);
    return res.data;
  },

  // Contact Messages
  async getAllContactMessages() {
    const res = await api.get('/contact/admin');
    return res.data;
  },

  async updateContactStatus(id, status, adminReply) {
    const res = await api.put(`/contact/${id}/status`, { status, adminReply });
    return res.data;
  },
};
