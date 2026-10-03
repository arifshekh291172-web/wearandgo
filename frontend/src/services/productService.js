import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getSuggestions(query) {
    const res = await api.get('/products/suggestions', { params: { q: query } });
    return res.data;
  },

  async getProduct(slugOrId) {
    const res = await api.get(`/products/${slugOrId}`);
    return res.data;
  },

  async getRelatedProducts(id) {
    const res = await api.get(`/products/${id}/related`);
    return res.data;
  },

  async getHomeCollections() {
    const res = await api.get('/products/collections/home');
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/categories');
    return res.data;
  },

  async getBanners() {
    const res = await api.get('/banners');
    return res.data;
  },

  async getReviews(productId) {
    const res = await api.get(`/reviews/product/${productId}`);
    return res.data;
  },

  async addReview(data) {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  async validateCoupon(code, subtotal) {
    const res = await api.post('/coupons/validate', { code, subtotal });
    return res.data;
  },

  async submitContact(data) {
    const res = await api.post('/contact', data);
    return res.data;
  },

  async subscribeNewsletter(email) {
    const res = await api.post('/contact/newsletter/subscribe', { email });
    return res.data;
  },
};
