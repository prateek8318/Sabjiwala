import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '../service/apiService';

type FavoritesContextType = {
  favoritesCount: number;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [favoritesCount, setFavoritesCount] = useState(0);

  const refreshFavorites = async () => {
    try {
      const res = await ApiService.getWishlist();
      let items = [];
      
      // Handle different response structures
      if (res?.data?.wishlist?.items && Array.isArray(res.data.wishlist.items)) {
        items = res.data.wishlist.items;
      } else if (res?.data?.wishlist && Array.isArray(res.data.wishlist)) {
        items = res.data.wishlist;
      } else if (res?.data?.wishlist?.products && Array.isArray(res.data.wishlist.products)) {
        items = res.data.wishlist.products;
      } else if (res?.data?.data?.items) {
        items = res.data.data.items;
      } else if (res?.data?.items) {
        items = res.data.items;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      }
      
      setFavoritesCount(items.length);
    } catch (error) {
      console.error('Error refreshing favorites count:', error);
      setFavoritesCount(0);
    }
  };

  // Initial load
  useEffect(() => {
    refreshFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{ favoritesCount, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
