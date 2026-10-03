import api from './api';

export const wishlistService = {
  async getWishlist() {
    const res = await api.get('/wishlist');
    return res.data;
  },

  async toggleWishlist(productId) {
    const res = await api.post('/wishlist/toggle', { productId });
    return res.data;
  },

  async removeFromWishlist(productId) {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data;
  },
};
