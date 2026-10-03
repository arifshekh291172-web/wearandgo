import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wear_and_go_guest_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  // Fetch server wishlist when logged in
  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await wishlistService.getWishlist();
        if (res.success && res.wishlist) {
          setWishlistItems(res.wishlist.products || []);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Persist guest wishlist
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wear_and_go_guest_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlistItems.some((item) => (item._id || item) === productId);
    },
    [wishlistItems]
  );

  const toggleWishlist = async (product) => {
    const prodId = product._id || product;

    if (isAuthenticated) {
      try {
        const res = await wishlistService.toggleWishlist(prodId);
        if (res.success) {
          setWishlistItems(res.wishlist.products || []);
          if (res.action === 'added') {
            toast.success('Added to Wishlist ❤️');
          } else {
            toast.info('Removed from Wishlist');
          }
          return res.action;
        }
      } catch (err) {
        toast.error('Wishlist action failed');
      }
    } else {
      // Guest local toggle
      const exists = isInWishlist(prodId);
      if (exists) {
        setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== prodId));
        toast.info('Removed from Wishlist');
        return 'removed';
      } else {
        setWishlistItems((prev) => [...prev, product]);
        toast.success('Added to Wishlist ❤️');
        return 'added';
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        await wishlistService.removeFromWishlist(productId);
        setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== productId));
        toast.info('Removed from Wishlist');
      } catch (err) {
        toast.error('Could not remove from wishlist');
      }
    } else {
      setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== productId));
      toast.info('Removed from Wishlist');
    }
  };

  const value = {
    wishlistItems,
    count: wishlistItems.length,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
