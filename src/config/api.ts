// Centralized API configuration
export const API_CONFIG = {
  // Use environment variable or default to production
  // BASE_URL: 'http://159.89.146.245:5010/api/',
  // IMAGE_BASE_URL: 'http://159.89.146.245:5010/',
  
  // Development override (uncomment for local development)
  BASE_URL: 'http://192.168.1.25:7006/api/',
  IMAGE_BASE_URL: 'http://192.168.1.25:7006/',
  
  // External APIs
  POSTAL_PINCODE_API: 'https://api.postalpincode.in/pincode/',
  
  TIMEOUT: 30000,
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: 'user/login',
    SEND_OTP: 'user/send-otp',
    VERIFY_OTP: 'user/verify-otp',
    
    // User
    PROFILE: 'user/profile',
    ADDRESS: 'user/address',
    LOCATION: 'user/location',
    
    // Cart
    CART: 'user/cart',
    
    // Wishlist
    WISHLIST: 'user/wishlist',
    
    // Orders
    ORDER: 'user/order',
    
    // Products
    HOME: 'user/home',
    CATEGORY: 'user/category/list',
    SUB_CATEGORY: 'user/subCategoryList',
    PRODUCTS: 'user/getsubCategoryProductList',
    PRODUCT_DETAIL: 'user/product/productdetail',
    
    // Wallet
    WALLET: 'user/walletHistory',
    WALLET_BALANCE: 'user/getWalletBalance',
    
    // Notifications
    NOTIFICATIONS: 'user/get-notification',
    
    // CMS
    CMS: 'user/cms',
  }
};

// Simple request cache
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheRequest = (key: string, data: any) => {
  requestCache.set(key, { data, timestamp: Date.now() });
};

export const getCachedRequest = (key: string) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const clearCache = () => {
  requestCache.clear();
};
