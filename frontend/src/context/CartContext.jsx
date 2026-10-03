import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { cartService } from '../services/cartService';
import { productService } from '../services/productService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { STORE_CONFIG } from '../utils/config';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wear_and_go_guest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('wear_and_go_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync on login or fetch user cart
  useEffect(() => {
    const fetchOrSyncCart = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const localItems = JSON.parse(localStorage.getItem('wear_and_go_guest_cart') || '[]');
          if (localItems.length > 0) {
            // Sync guest cart to user server cart
            const res = await cartService.syncCart(localItems);
            if (res.success && res.cart) {
              setCartItems(res.cart.items || []);
              localStorage.removeItem('wear_and_go_guest_cart');
            }
          } else {
            // Fetch server cart
            const res = await cartService.getCart();
            if (res.success && res.cart) {
              setCartItems(res.cart.items || []);
            }
          }
        } catch (err) {
          console.error('Error fetching cart:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrSyncCart();
  }, [isAuthenticated]);

  // Persist guest cart to localStorage when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wear_and_go_guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Save/remove coupon to localStorage
  useEffect(() => {
    if (coupon) {
      localStorage.setItem('wear_and_go_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('wear_and_go_coupon');
    }
  }, [coupon]);

  // Computed values
  const { subtotal, count } = useMemo(() => {
    let sub = 0;
    let totalCount = 0;

    cartItems.forEach((item) => {
      const prod = item.product;
      const price = prod?.discountPrice || prod?.price || item.price || 0;
      sub += price * item.quantity;
      totalCount += item.quantity;
    });

    return { subtotal: sub, count: totalCount };
  }, [cartItems]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.discountType === 'percentage') {
      const disc = Math.round((subtotal * coupon.discountValue) / 100);
      return coupon.maximumDiscount > 0 ? Math.min(disc, coupon.maximumDiscount) : disc;
    }
    return Math.min(subtotal, coupon.discountValue || 0);
  }, [coupon, subtotal]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= STORE_CONFIG.freeShippingThreshold ? 0 : STORE_CONFIG.shippingFee;
  }, [subtotal]);

  const tax = useMemo(() => {
    return Math.round((subtotal - discount) * 0.05); // 5% GST
  }, [subtotal, discount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping + tax);
  }, [subtotal, discount, shipping, tax]);

  // Actions
  const addToCart = async (product, size, color, quantity = 1) => {
    const qty = Number(quantity);
    if (!product || !size) {
      toast.error('Please choose a size');
      return false;
    }

    if (product.stock < qty) {
      toast.error(`Only ${product.stock} left in stock!`);
      return false;
    }

    if (isAuthenticated) {
      try {
        const res = await cartService.addToCart(product._id, size, color, qty);
        if (res.success && res.cart) {
          setCartItems(res.cart.items || []);
          toast.success(`"${product.name}" added to bag`);
          return true;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not add to cart');
        return false;
      }
    } else {
      // Guest cart local manipulation
      setCartItems((prev) => {
        const index = prev.findIndex(
          (item) =>
            (item.product?._id || item.product) === product._id &&
            item.size === size &&
            (item.color || 'Default') === (color || 'Default')
        );

        if (index > -1) {
          const next = [...prev];
          const newQty = Math.min(product.stock, next[index].quantity + qty);
          next[index] = { ...next[index], quantity: newQty };
          return next;
        } else {
          return [
            ...prev,
            {
              _id: 'guest_' + Date.now() + Math.random().toString(36).substr(2, 4),
              product,
              size,
              color: color || 'Default',
              quantity: qty,
              price: product.discountPrice || product.price,
            },
          ];
        }
      });
      toast.success(`"${product.name}" added to bag`);
      return true;
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) {
      return removeItem(itemId);
    }

    if (isAuthenticated) {
      try {
        const res = await cartService.updateCartItem(itemId, { quantity: newQty });
        if (res.success && res.cart) {
          setCartItems(res.cart.items || []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Stock limit exceeded');
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) => {
          if (item._id === itemId) {
            const maxStock = item.product?.stock || 99;
            return { ...item, quantity: Math.min(newQty, maxStock) };
          }
          return item;
        })
      );
    }
  };

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.removeFromCart(itemId);
        if (res.success && res.cart) {
          setCartItems(res.cart.items || []);
          toast.info('Item removed from bag');
        }
      } catch (err) {
        toast.error('Failed to remove item');
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.info('Item removed from bag');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch {
        // Ignore
      }
    }
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    if (!code || code.trim() === '') {
      toast.error('Please enter a coupon code');
      return false;
    }

    try {
      const res = await productService.validateCoupon(code.trim().toUpperCase(), subtotal);
      if (res.success && res.coupon) {
        setCoupon(res.coupon);
        toast.success(res.message);
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.info('Coupon removed');
  };

  const value = {
    cartItems,
    count,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
