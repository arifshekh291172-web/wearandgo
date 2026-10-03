import api from './api';

export const cartService = {
  async getCart() {
    const res = await api.get('/cart');
    return res.data;
  },

  async addToCart(productId, size, color, quantity = 1) {
    const res = await api.post('/cart', { productId, size, color, quantity });
    return res.data;
  },

  async updateCartItem(itemId, data) {
    const res = await api.put(`/cart/${itemId}`, data);
    return res.data;
  },

  async removeFromCart(itemId) {
    const res = await api.delete(`/cart/${itemId}`);
    return res.data;
  },

  async clearCart() {
    const res = await api.delete('/cart');
    return res.data;
  },

  async syncCart(items) {
    const res = await api.post('/cart/sync', { items });
    return res.data;
  },
};
