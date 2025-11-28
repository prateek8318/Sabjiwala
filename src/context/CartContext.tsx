// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://167.71.232.245:8539/api/user/cart';

type CartItem = {
  id: string;
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
  addItem: (productId: string) => Promise<void>;
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
    try {
      await axios.put(`${API_URL}/${id}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.log('Update failed');
    }
  };

  const removeItem = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchCart();
    } catch (err) {
      console.log('Delete failed');
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