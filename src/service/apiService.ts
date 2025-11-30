

///6.11.25
// src/services/api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from './storage';



// -------------------------------------------------
// 1. Base URL (your live dev server)
const BASE_URL = 'http://167.71.232.245:8539/api/';
export const IMAGE_BASE_URL = 'http://167.71.232.245:8539/';

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

  getSubCategoryProducts: async (subCategoryId: string) => {
    const endpoint = subCategoryId === 'all'
      ? 'user/getsubCategoryProductList/all'  // or your "all products" endpoint
      : `user/getsubCategoryProductList/${subCategoryId}`;
    return await api.get(endpoint);
  },
  getProductDetail: async (productId: string) => {
    return await api.get(`user/product/productdetail/${productId}`);
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

  removeCartItem: async (productId: string) => {
    console.log(":::::::::", productId);
    const response = await api.delete('user/cart', {
      data: { productId }
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

  // ---- Logout ----
  logout: () => storage.removeToken(),
};

export default ApiService;

