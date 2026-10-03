import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wear_and_go_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('wear_and_go_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return null;
      }
      const data = await authService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('wear_and_go_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch {
      localStorage.removeItem('wear_and_go_token');
      localStorage.removeItem('wear_and_go_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data.success) {
        localStorage.setItem('wear_and_go_token', data.token);
        localStorage.setItem('wear_and_go_user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      if (data.success) {
        localStorage.setItem('wear_and_go_token', data.token);
        localStorage.setItem('wear_and_go_user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success('Account created successfully!');
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('wear_and_go_token');
      localStorage.removeItem('wear_and_go_user');
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  const updateProfile = async (formData) => {
    try {
      const data = await authService.updateProfile(formData);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('wear_and_go_user', JSON.stringify(data.user));
        toast.success('Profile updated successfully');
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update profile';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const data = await authService.addAddress(addressData);
      if (data.success) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }));
        toast.success('Address saved successfully');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save address';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const data = await authService.updateAddress(id, addressData);
      if (data.success) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }));
        toast.success('Address updated');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update address';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const deleteAddress = async (id) => {
    try {
      const data = await authService.deleteAddress(id);
      if (data.success) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }));
        toast.success('Address removed');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove address';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    addAddress,
    updateAddress,
    deleteAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
