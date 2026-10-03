import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async updatePassword(data) {
    const res = await api.put('/auth/update-password', data);
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token, password) {
    const res = await api.put(`/auth/reset-password/${token}`, { password });
    return res.data;
  },

  async addAddress(address) {
    const res = await api.post('/auth/addresses', address);
    return res.data;
  },

  async updateAddress(id, address) {
    const res = await api.put(`/auth/addresses/${id}`, address);
    return res.data;
  },

  async deleteAddress(id) {
    const res = await api.delete(`/auth/addresses/${id}`);
    return res.data;
  },
};
