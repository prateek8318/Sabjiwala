// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Vibration } from 'react-native';
import Toast from 'react-native-toast-message';
import { LocalStorage } from '../helpers/localstorage';
import { logger } from '../utils/logger';
import { API_CONFIG, getCachedRequest, cacheRequest } from '../config/api';

const API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}`;
const VIBRATION_DURATION = 50;

type CartItem = {
  id: string;
  productId?: string | { _id: string; [key: string]: any };
  name: string;
  price: number;
  image: any;
  weight: string;
  quantity: number;
  mrp?: number;
};

type CartContextType = {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  totalSavings: number;
  loading: boolean;
  addItem: (product: any, variant?: string) => Promise<void>;
  updateQuantity: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  fetchCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized total items calculation
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [items]);

  const calculateTotalItems = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await LocalStorage.read('@auth_token')}`
        }
      });

      logger.log('Fetched cart data:', res.data);

      if (res.data && res.data.success) {
        const cartItems = res.data.data?.items || [];
        logger.log('Setting cart items:', cartItems);
        setItems(cartItems);
      } else {
        logger.log('No cart data or error in response');
        setItems([]);
      }
    } catch (err) {
      logger.error('Cart fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (product: any, variant = '1 Kg') => {
    try {
      setLoading(true);
      const response = await axios.post(API_URL, {
        productId: product._id,
        quantity: 1,
        variant: variant,
      });

      // Optimistically update the UI
      const newItem: CartItem = {
        id: response.data.data?._id || Date.now().toString(),
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: variant,
        quantity: 1,
        mrp: product.mrp
      };

      setItems(prevItems => [...prevItems, newItem]);

      // Then sync with server
      await fetchCart();
    } catch (err: any) {
      logger.error('Add to cart failed:', err.response?.data || err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    setItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        const itemId = item.id || (typeof item.productId === 'object' ? item.productId?._id : item.productId);
        if (itemId === id) {
          return { ...item, quantity };
        }
        return item;
      });
      return updatedItems;
    });

    Vibration.vibrate(VIBRATION_DURATION);

    try {
      await axios.put(`${API_URL}/${id}`, { quantity });
      fetchCart(); // Refresh cart to ensure sync
    } catch (err) {
      logger.error('Update failed', err);
      fetchCart().catch(console.error);
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (id: string) => {
    const previousItems = [...items];

    try {
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => {
          const itemId = item.id || (typeof item.productId === 'object' ? item.productId?._id : item.productId);
          return itemId !== id;
        });
        return updatedItems;
      });

      await axios.delete(`${API_URL}/${id}`);

      if (items.length > 1) {
        fetchCart().catch(console.error);
      }
    } catch (err) {
      logger.error('Delete failed', err);
      setItems(previousItems);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove item. Please try again.',
      });
    }
  }, [items, fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Memoized calculations
  const totalPrice = useMemo(() => 
    items.reduce((sum, i) => sum + i.price * i.quantity, 0), 
    [items]
  );
  
  const totalSavings = useMemo(() => 
    items.reduce((sum, i) => sum + ((i.mrp || i.price) - i.price) * i.quantity, 0), 
    [items]
  );

  return (
    <CartContext.Provider value={{
      items,
      totalPrice,
      totalItems,
      totalSavings,
      loading,
      addItem,
      updateQuantity,
      removeItem,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};