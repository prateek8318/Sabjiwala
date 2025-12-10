

///6.11.25
// src/services/api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from './storage';



// -------------------------------------------------
// 1. Base URL (your live dev server)
// const BASE_URL = 'http://159.89.146.245:5010/api/';
 const BASE_URL = 'http://192.168.1.26:5002/api/';
export const IMAGE_BASE_URL = 'http://159.89.146.245:5010/';
//  export const IMAGE_BASE_URL = 'http://192.168.1.12:5002/';

// 1. Base URL (your local dev server)
// const BASE_URL = 'http://192.168.1.21:5002/api/';
// export const IMAGE_BASE_URL = 'http://192.168.1.21:5002/';

// -------------------------------------------------
// 2. Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// -------------------------------------------------
// 3. Pretty-print & time helpers
const pretty = (obj: any) => JSON.stringify(obj, null, 2);
const now = () => new Date().toISOString().replace('T', ' ').substr(0, 19);

// -------------------------------------------------
// 4. REQUEST INTERCEPTOR – token + full log
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('\nAPI REQUEST');
    console.log(`Time: ${now()}`);
    console.log(`TOKEN:::: ${token}`);
    console.log(`URL: ${config.baseURL}${config.url}`);
    console.log(`Method: ${config.method?.toUpperCase()}`);
    console.log(`Headers:`, pretty(config.headers || {}));
    if (config.data) console.log(`Payload:`, pretty(config.data));
    if (config.params) console.log(`Params:`, pretty(config.params));
    console.log('─────────────────────────────────');
    return config;
  },
  (error) => {
    console.log('REQUEST SETUP ERROR:', error);
    return Promise.reject(error);
  }
);

// -------------------------------------------------
// 5. RESPONSE INTERCEPTOR – full log + 401 logout
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('\nAPI RESPONSE');
    console.log(`Time: ${now()}`);
    console.log(`URL: ${response.config.url}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Data:`, pretty(response.data));
    console.log('─────────────────────────────────');
    return response;
  },
  (error) => {
    console.log('\nAPI ERROR');
    console.log(`Time: ${now()}`);
    console.log(`URL: ${error.config?.url}`);
    console.log(`Status: ${error.response?.status || 'Network Error'}`);
    console.log(`Message: ${error.message}`);
    if (error.response?.data) {
      console.log(`Error Data:`, pretty(error.response.data));
    }

    // Auto-logout on 401
    if (error.response?.status === 401) {
      storage.removeToken();
      console.log('Token expired → Logged out');
      navigation.navigate('Login');
    }

    console.log('─────────────────────────────────');
    return Promise.reject(error);
  }
);

// -------------------------------------------------
// 6. API SERVICE (all CRUD + helpers)
export const ApiService = {
  // ---- CRUD ----

  getImage: (image: string) => `${IMAGE_BASE_URL}${image}`,
  get: (endpoint: string, params?: any) => api.get(endpoint, { params }),
  post: (endpoint: string, data: any) => api.post(endpoint, data),
  put: (endpoint: string, data: any) => api.put(endpoint, data),
  patch: (endpoint: string, data: any) => api.patch(endpoint, data),
  delete: (endpoint: string) => api.delete(endpoint),

  // ---- Multipart Upload ----
  upload: (endpoint: string, fileUri: string, fieldName = 'file') => {
    const formData = new FormData();
    formData.append(fieldName, {
      uri: fileUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    return api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadProfileImage: (
    file: FormData | { uri: string; name?: string; type?: string } | string,
    fieldName = 'image' // backend multer expects "image"
  ) => {
    const formData = (file && typeof file === 'object' && 'append' in file)
      ? (file as FormData)
      : (() => {
          const fd = new FormData();
          const fileUri = typeof file === 'string' ? file : file.uri;
          fd.append(fieldName, {
            uri: fileUri,
            name: (typeof file === 'string' ? undefined : file.name) || 'profile.jpg',
            type: (typeof file === 'string' ? undefined : file.type) || 'image/jpeg',
          } as any);
          return fd;
        })();

    // Backend accepts profile update with multipart form-data on the same profile route
    return api.patch('user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateProfile: async (data: { name?: string; email?: string; profileImage?: string; image?: string }) => {
    return await api.patch('user/profile', data);
  },

  getUserProfile: async () => {
    const response = await api.get('user/profile');
    return response;
  },
  // ---- Login (example) ----
  login: async (email: string, password: string) => {
    const res = await api.post('user/login', { email, password });
    const token = res.data.token || res.data.access_token;
    if (token) await storage.saveToken(token);
    return res;
  },

  // ---- SEND OTP (your endpoint) ----
  sendOtp: async (mobileNo: string) => {
    const response = await api.post('user/send-otp', { mobileNo });
    return response;               // <-- full axios response (status + data)
  },

  verifyOtp: async (mobileNo: string, otp: string) => {
    const response = await api.post('user/verify-otp', { mobileNo, otp });
    return response;               // <-- full axios response (status + data)
  },
  sendCurrentLoc: async (lat: string, long: string) => {
    const response = await api.patch('user/location', { lat, long });
    return response;
  },
  // ─────────────────────────────────────────────
  // ADDRESS API FUNCTIONS
  // ─────────────────────────────────────────────
  getAddresses: async () => {
    return await api.get('user/address/');
  },
  addAddress: async (addressData: any) => {
    return await api.post('user/address/', addressData);
  },
  updateAddress: async (addressId: string, addressData: any) => {
    return await api.patch(`user/address/${addressId}`, addressData);
  },
  deleteAddress: async (addressId: string) => {
    return await api.delete(`user/address/${addressId}`);
  },
  // Optional: Set default address
  setDefaultAddress: async (addressId: string) => {
    return await api.patch(`user/address/default/${addressId}`);
  },

  // ---- FETCH USER HOME DATA ----
  getUserHome: async () => {
    const response = await api.get('user/home');
    return response; // full axios response (status + data)
  },
  getHomeCategory: async () => {
    const response = await api.get('user/getSubCategries');
    return response; // full axios response (status + data)
  },

  getHomeStaticData: async () => {
    const response = await api.get('user/homeStaticContent');
    return response; // full axios response (status + data)
  },

  getHomeContent: async () => {
    return await api.get('user/homeProductContent');
  },
  placeOrder: async (payload = {}) => {
    return await api.post('user/order', payload);
  },
  getSubCategoryProducts: async (subCategoryId: string) => {
    const endpoint = subCategoryId === 'all'
      ? 'user/getsubCategoryProductList/all'  // or your "all products" endpoint
      : `user/getsubCategoryProductList/${subCategoryId}`;
    return await api.get(endpoint);
  },
  getProductDetail: async (productId: string) => {
    return await api.get(`user/product/productdetail/${productId}`);
  },



getHomeProductContent: async () => {
  return await api.get('user/homeProductContent');
},
  getSubCategoryList: async (categoryId: string) => {
    const endpoint = `user/subCategoryList/${categoryId}`;
    return await api.get(endpoint);
  },

  getCategory: async () => {
    const response = await api.get('user/category/list');
    return response;
  },

  getCart: async () => {
    const response = await api.get('user/cart');
    return response;
  },

  getCoupons: async () => {
    return await api.get('user/coupon');
  },

  removeCartItem: async (productId: string, variantId?: string) => {
    // Include variantId so only the targeted variant is removed
    const response = await api.delete('user/cart', {
      data: { productId, variantId }
    });
    return response;
  },


  addToCart: async (productId: string, varientId: string, quantity: string) => {
    const response = await api.post('user/cart', {
      "productId": productId,
      "variantId": varientId,
      "quantity": quantity
    });
    return response;
  },

  addToWishlist: async (productId: string) => {
    const response = await api.post('user/wishlist', {
      "productId": productId,

    });
    return response;
  },
  getWishlist: async () => {
    const response = await api.get('user/wishlist');
    return response;
  },

  deleteWishlist: async (productId: string) => {
    console.log("Deleting wishlist item - ID:", productId);
    const response = await api.delete(`user/wishlist/${productId}`);
    console.log("Wishlist item deleted successfully:", response.data);
    return response;
  },
  // apiService.ts me yeh 3 functions add kar de (kahi bhi, end me best)

  getMyOrders: async () => {
    return await api.get('user/order'); 
  },

  getOrderDetails: async (orderId: string) => {
    return await api.get('user/order', { params: { orderId } });
  },

  reorder: async (orderId: string) => {
    return await api.post('user/order', { oldOrderId: orderId }); // ya jo bhi backend expect kare
  },

  submitOrderRating: async (ratingData: any) => {
    return await api.post('user/product/rating', ratingData);
  },

  // ---- Wallet History ----
  createWalletHistory: async (walletData: {
    amount: string;
    action: 'credit' | 'debit';
    razorpay_id: string;
    description?: string;
  }) => {
    return await api.post('user/walletHistory/create', walletData);
  },

  getWalletHistory: async () => {
    return await api.get('user/walletHistory/list');
  },

  getWalletBalance: async () => {
    return await api.get('user/getWalletBalance');
  },

  // ---- Razorpay ----
  createRazorpayOrder: async (amount: number | string) => {
    // Backend sample payload: { "amount": "100" } in rupees
    // Send as string to match backend expectation; backend converts to paise
    const rupees = typeof amount === 'number' ? amount.toString() : amount;
    return await api.post('user/create-razorpay-order', { amount: rupees, currency: 'INR' });
  },

  // ---- Logout ----
  logout: () => storage.removeToken(),
};

export default ApiService;

