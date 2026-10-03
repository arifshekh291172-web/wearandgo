import api from './api';

export const orderService = {
  async createOrder(data) {
    const res = await api.post('/orders', data);
    return res.data;
  },

  async getMyOrders() {
    const res = await api.get('/orders/my-orders');
    return res.data;
  },

  async getOrder(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async cancelOrder(id, reason) {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  async requestReturn(id, reason) {
    const res = await api.put(`/orders/${id}/return`, { reason });
    return res.data;
  },

  async getRazorpayKey() {
    const res = await api.get('/payment/key');
    return res.data;
  },

  async createRazorpayOrder(orderId) {
    const res = await api.post('/payment/create-order', { orderId });
    return res.data;
  },

  async verifyPayment(paymentData) {
    const res = await api.post('/payment/verify', paymentData);
    return res.data;
  },
};
