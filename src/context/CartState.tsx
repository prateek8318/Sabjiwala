import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Vibration } from 'react-native';
import ApiService from '../service/apiService';
import Toast from 'react-native-toast-message';

type CartItem = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images?: string[];
    primary_image?: string[];
  };
  variantId?: {
    _id: string;
    price: number;
    mrp: number;
    stock: string;
  };
  quantity: number;
  price: number;
  mrp: number;
  product?: any; // Add this line to match the usage in dashboard.tsx
};

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, variantId: string, quantity: number) => Promise<void>;
  getCartCount: () => number;
  refreshCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Refresh cart from API
  const refreshCart = async () => {
    return fetchCart();
  };

  // Fetch cart data
  const fetchCart = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await ApiService.getCart();
      const cartData = res?.data?.cart?.products || res?.data?.products || res?.data?.items || [];
      const items = Array.isArray(cartData) ? cartData : [];
      
      setItems(items);
      
      // Calculate totals
      const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const price = items.reduce((sum, item) => {
        const itemPrice = item.price || (item.variantId?.price || 0) * (item.quantity || 1);
        return sum + itemPrice;
      }, 0);
      
      setTotalItems(itemCount);
      setTotalPrice(price);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cart',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, variantId: string, quantity: number) => {
    try {
      await ApiService.addToCart(productId, variantId, quantity.toString());
      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Remove item from cart by productId and variantId
  const removeFromCart = async (productId: string, variantId?: string) => {
    const itemToRemove = items.find(item => 
      item.productId._id === productId && 
      (!variantId || item.variantId?._id === variantId)
    );
    
    if (!itemToRemove) return;
    
    return removeItem(itemToRemove._id);
  };

  // Remove item by cart item ID
  const removeItem = async (id: string) => {
    const previousItems = [...items];
    const itemToRemove = items.find(item => item._id === id);
    
    if (!itemToRemove) return;
    
    // Optimistic update
    setItems(prev => prev.filter(item => item._id !== id));
    
    try {
      await ApiService.removeCartItem(
        itemToRemove.productId._id, 
        itemToRemove.variantId?._id
      );
      
      // Update totals
      setTotalItems(prev => Math.max(0, prev - (itemToRemove.quantity || 1)));
      setTotalPrice(prev => {
        const itemPrice = itemToRemove.price || 
          (itemToRemove.variantId?.price || 0) * (itemToRemove.quantity || 1);
        return Math.max(0, prev - itemPrice);
      });
    } catch (error) {
      // Revert on error
      setItems(previousItems);
      console.error('Error removing item:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove item',
      });
      throw error;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, variantId);
      return;
    }

    const previousItems = [...items];
    
    // Optimistic update
    setItems(prev => 
      prev.map(item => 
        item.productId._id === productId && 
        item.variantId?._id === variantId
          ? { ...item, quantity }
          : item
      )
    );

    try {
      await ApiService.addToCart(productId, variantId, quantity.toString());
      // Don't need to refresh if optimistic update was successful
    } catch (error) {
      // Revert on error
      setItems(previousItems);
      console.error('Error updating cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update quantity',
      });
      throw error;
    }
  };

  // Get cart count with useCallback for performance
  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        removeItem,
        updateQuantity,
        getCartCount,
        refreshCart,
        fetchCart,
        totalItems,
        totalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
