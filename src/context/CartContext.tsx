// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Vibration } from 'react-native';
import Toast from 'react-native-toast-message';
import { LocalStorage } from '../helpers/localstorage';

const API_URL = 'http://167.71.232.245:8539/api/user/cart';
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
  const [totalItems, setTotalItems] = useState(0);

  // Update totalItems whenever items change
  useEffect(() => {
    const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setTotalItems(count);
    console.log('Cart items updated. Total items:', count);
  }, [items]);

  const calculateTotalItems = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await LocalStorage.read('@auth_token')}`
        }
      });

      console.log('Fetched cart data:', res.data);

      if (res.data && res.data.success) {
        const cartItems = res.data.data?.items || [];
        console.log('Setting cart items:', cartItems);
        setItems(cartItems);
      } else {
        console.log('No cart data or error in response');
        setItems([]);
      }
    } catch (err) {
      console.log('Cart fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: any, variant = '1 Kg') => {
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
      console.log('Add to cart failed:', err.response?.data || err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
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
      // Update total items count
      setTotalItems(calculateTotalItems(updatedItems));
      return updatedItems;
    });

    Vibration.vibrate(VIBRATION_DURATION);

    try {
      await axios.put(`${API_URL}/${id}`, { quantity });
      fetchCart(); // Refresh cart to ensure sync
    } catch (err) {
      console.log('Update failed', err);
      fetchCart().catch(console.error);
    }
  };

  const removeItem = async (id: string) => {
    const previousItems = [...items];

    try {
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => {
          const itemId = item.id || (typeof item.productId === 'object' ? item.productId?._id : item.productId);
          return itemId !== id;
        });
        // Update total items count
        setTotalItems(calculateTotalItems(updatedItems));
        return updatedItems;
      });

      await axios.delete(`${API_URL}/${id}`);

      if (items.length > 1) {
        fetchCart().catch(console.error);
      }
    } catch (err) {
      console.log('Delete failed', err);
      setItems(previousItems);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove item. Please try again.',
      });
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update totalItems whenever items change (including optimistic updates)
  useEffect(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    setTotalItems(count);

    console.log('Cart items updated:', items);
    console.log('Total items count:', count);
    console.log('Providing to context - totalItems:', count);
  }, [items]);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalSavings = items.reduce((sum, i) => sum + ((i.mrp || i.price) - i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalPrice,
      totalSavings,
      totalItems,  // Real-time updated count
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