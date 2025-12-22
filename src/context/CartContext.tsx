// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Vibration } from 'react-native';
import Toast from 'react-native-toast-message';

const API_URL = 'http://167.71.232.245:8539/api/user/cart';

// Vibration duration in milliseconds
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

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: 'Bearer YOUR_TOKEN' } // agar token hai toh
      });
      setItems(res.data.data.items || []);
    } catch (err) {
      console.log('Cart fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ADD TO CART FUNCTION – YEH ZAROORI HAI
  const addItem = async (product: any, variant = '1 Kg') => {
    try {
      await axios.post(API_URL, {
        productId: product._id,
        quantity: 1,
        variant: variant,
      });
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.log('Add to cart failed:', err.response?.data || err);
      throw err;
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }
    
    // Optimistically update the UI
    setItems(prevItems => {
      return prevItems.map(item => {
        const itemId = item.id || (typeof item.productId === 'object' ? item.productId?._id : item.productId);
        if (itemId === id) {
          return { ...item, quantity };
        }
        return item;
      });
    });
    
    // Provide haptic feedback
    Vibration.vibrate(VIBRATION_DURATION);
    
    try {
      await axios.put(`${API_URL}/${id}`, { quantity });
      // Don't fetch cart again, we already updated optimistically
    } catch (err) {
      console.log('Update failed', err);
      // Revert on error
      fetchCart().catch(console.error);
    }
  };

  const removeItem = async (id: string) => {
    // Store the current items for potential rollback
    const previousItems = [...items];
    
    try {
      // Optimistically update the UI immediately
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => {
          const itemId = item.id || 
            (typeof item.productId === 'object' ? item.productId?._id : item.productId);
          return itemId !== id;
        });
        return updatedItems;
      });
      
      // Make the API call in the background
      await axios.delete(`${API_URL}/${id}`);
      
      // Only fetch if we still have items, otherwise the cart will be hidden
      if (items.length > 1) {
        fetchCart().catch(console.error);
      }
    } catch (err) {
      console.log('Delete failed', err);
      // Revert to previous state on error
      setItems(previousItems);
      
      // Show error to user
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

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalSavings = items.reduce((sum, i) => sum + (i.mrp - i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalPrice,
      totalSavings,
      loading,
      addItem,           // <-- YEH PROVIDE KIYA
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