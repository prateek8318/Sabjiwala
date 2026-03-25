///6.11.25
// src/services/api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api';
import { storage } from './storage';
import { OrderDetailsResponse, OrderTrackingResponse, LocationUpdatePayload, LocationUpdateEvent, OrderStatusUpdateEvent } from '../@types';



// -------------------------------------------------
// 1. Base URL (your live dev server)
const BASE_URL = 'http://159.89.146.245:5010/api/';
 export const IMAGE_BASE_URL = 'http://159.89.146.245:5010/';

// 1. Base URL (your local dev server)
// const BASE_URL = 'http://192.168.1.25:7006/api/';
// export const IMAGE_BASE_URL = 'http://192.168.1.25:7006/';

// -------------------------------------------------
// 2. Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

const inflightGetRequests = new Map<string, Promise<AxiosResponse>>();
const recentGetResponses = new Map<
  string,
  { expiresAt: number; response: AxiosResponse }
>();

const buildRequestKey = (endpoint: string, params?: any) => {
  if (!params) {
    return endpoint;
  }

  try {
    return `${endpoint}?${JSON.stringify(params)}`;
  } catch {
    return endpoint;
  }
};

const coalescedGet = (
  endpoint: string,
  params?: any,
  ttlMs = 0,
): Promise<AxiosResponse> => {
  const key = buildRequestKey(endpoint, params);
  const nowTs = Date.now();
  const cached = recentGetResponses.get(key);

  if (cached && cached.expiresAt > nowTs) {
    return Promise.resolve(cached.response);
  }

  const inflight = inflightGetRequests.get(key);
  if (inflight) {
    return inflight;
  }

  const request = api
    .get(endpoint, params ? { params } : undefined)
    .then(response => {
      if (ttlMs > 0) {
        recentGetResponses.set(key, {
          expiresAt: Date.now() + ttlMs,
          response,
        });
      }
      return response;
    })
    .finally(() => {
      inflightGetRequests.delete(key);
    });

  inflightGetRequests.set(key, request);
  return request;
};

// -------------------------------------------------
// 3. Pretty-print & time helpers (dev only)
const pretty = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};
const now = () => new Date().toISOString().replace('T', ' ').substr(0, 19);

// -------------------------------------------------
// 4. REQUEST INTERCEPTOR – token + full log
api.interceptors.request.use(
  async (config) => { 
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Heavy logging can freeze JS on low-end devices; keep it DEV-only.
    if (__DEV__) {
      console.log('\nAPI REQUEST');
      console.log(`Time: ${now()}`);
      console.log(`URL: ${config.baseURL}${config.url}`);
      console.log(`Method: ${config.method?.toUpperCase()}`);
      // Don't print full token/payloads in logs (perf + security)
      if (config.params) console.log(`Params:`, pretty(config.params));
      console.log('─────────────────────────────────');
    }
    return config;
  },
  (error) => {
    if (__DEV__) console.log('REQUEST SETUP ERROR:', error);
    return Promise.reject(error);
  }
);

// -------------------------------------------------
// 5. RESPONSE INTERCEPTOR – full log + 401 logout
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log('\nAPI RESPONSE');
      console.log(`Time: ${now()}`);
      console.log(`URL: ${response.config.url}`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      // Avoid printing huge response bodies (freezes UI)
      const dataType = Array.isArray(response.data) ? 'array' : typeof response.data;
      console.log(`DataType: ${dataType}`);
      console.log('─────────────────────────────────');
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.log('\nAPI ERROR');
      console.log(`Time: ${now()}`);
      console.log(`URL: ${error.config?.url}`);
      console.log(`Status: ${error.response?.status || 'Network Error'}`);
      console.log(`Message: ${error.message}`);
    }

    // Auto-logout on 401
    if (error.response?.status === 401) {
      storage.removeToken();
      if (__DEV__) console.log('Token expired → Logged out');
    }

    if (__DEV__) console.log('─────────────────────────────────');
    return Promise.reject(error);
  }
);

// -------------------------------------------------
// 6. API SERVICE (all CRUD + helpers)
export const ApiService = {
  // ---- CRUD ----

  getImage: (image: string) => `${IMAGE_BASE_URL}${image}`,
  get: (endpoint: string, params?: any) => coalescedGet(endpoint, params),
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
    const response = await coalescedGet('user/profile', undefined, 1500);
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
    return await coalescedGet('user/address/', undefined, 1000);
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
    const response = await coalescedGet('user/getSubCategries', undefined, 1000);
    return response; // full axios response (status + data)
  },

  getHomeStaticData: async () => {
    const response = await coalescedGet('user/homeStaticContent', undefined, 1000);
    return response; // full axios response (status + data)
  },

  getHomeContent: async () => {
    return await coalescedGet('user/homeProductContent', undefined, 1000);
  },
  getTypeBasedProduct: async (type: string) => {
    const endpoint = `user/home/typeBasedProduct/${type}`;
    return await api.get(endpoint);
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

  getExploreSection: async (exploreSectionId: string) => {
    return await api.get(`user/explore/${exploreSectionId}`);
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
    const response = await coalescedGet('user/cart', undefined, 500);
    return response;
  },

  getCoupons: async () => {
    return await coalescedGet('user/coupon', undefined, 500);
  },

  removeCartItem: async (productId: string, variantId?: string) => {
    // Only send variantId when we actually have one
    const payload: any = { productId };
    if (variantId) payload.variantId = variantId;

    const response = await api.delete('user/cart', { data: payload });
    return response;
  },

  addToCart: async (productId: string, variantId: string | undefined, quantity: string) => {
    const payload: any = {
      productId,
      quantity,
    };
    if (variantId) payload.variantId = variantId;

    const response = await api.post('user/cart', payload);
    return response;
  },

  addToWishlist: async (productId: string) => {
    const response = await api.post('user/wishlist', {
      "productId": productId,

    });
    return response;
  },
  getWishlist: async () => {
    const response = await coalescedGet('user/wishlist', undefined, 500);
    return response;
  },

  deleteWishlist: async (productId: string) => {
    console.log("Deleting wishlist item - ID:", productId);
    const response = await api.delete(`user/wishlist/${productId}`);
    console.log("Wishlist item deleted successfully:", response.data);
    return response;
  },


  getMyOrders: async () => {
    return await api.get('user/order'); 
  },

  getOrderDetails: async (orderId: string): Promise<AxiosResponse<OrderDetailsResponse>> => {
    return await api.get(`user/order/${orderId}`);
  },

  getOrderRatings: async (orderId: string) => {
    return await api.get('user/product/rating', { params: { orderId } });
  },

  reorder: async (orderId: string) => {
    return await api.post('user/order', { oldOrderId: orderId }); 
  },

  submitOrderRating: async (ratingData: any) => {
    return await api.post('user/product/rating', ratingData);
  },

  createReturnRequest: async (orderId: string, payload: any) => {
    return await api.post(`user/order/${orderId}/return`, payload);
  },

  // ---- Wallet History ----
  createWalletHistory: async (walletData: {
    amount: string;
    action: 'credit' | 'debit';
    razorpay_id: string;
    description?: string;
    skipDeduction?: boolean;
  }) => {
    return await api.post('user/walletHistory/create', walletData);
  },

  getWalletHistory: async () => {
    // Try multiple possible endpoints if needed
    try {
      // Try the main endpoint first
      const response = await api.get('user/walletHistory/list');
      
      // If the response has data in the expected format, return it
      if (response?.data?.data) {
        return response;
      }
      
      // If not, try alternative endpoints
      const altResponse = await api.get('wallet/history');
      return altResponse;
    } catch (error) {
      console.log('Error fetching wallet history:', error);
      throw error;
    }
  },

  getWalletBalance: async () => {
    return await api.get('user/getWalletBalance');
  },

  // ---- Razorpay ----
  createRazorpayOrder: async (amount: number | string) => {
   
    const rupees = typeof amount === 'number' ? amount.toString() : amount;
    return await api.post('user/create-razorpay-order', { amount: rupees, currency: 'INR' });
  },

  // ---- Logout ----
  logout() {
    return api.post('user/logout', {});
  },
  
  // Notifications
  getNotifications() {
    return coalescedGet('user/get-notification', undefined, 500);
  },
  
  deleteNotification(notificationId: string) {
    return api.get(`user/cancel-notification/${notificationId}`);
  },

  // ─────────────────────────────────────────────
  // CMS API FUNCTIONS
  // ─────────────────────────────────────────────
  
  // Get CMS content by type
  getCmsContent: async (contentType?: string) => {
    // Always call the general endpoint to get all data (better data structure)
    const endpoint = 'user/cms';
    return contentType ? api.get(endpoint, { params: { contentType } }) : api.get(endpoint);
  },

  // Get all products globally - enhanced version
  getAllProducts: async () => {
    try {
      // Try the new proper endpoint first
      const endpoints = [
        'user/products/all',               // New proper endpoint
        'user/getsubCategoryProductList/all',  // Working fallback endpoint
        'user/homeProductContent',         // Home content fallback
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`[ApiService] Trying endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          console.log(`[ApiService] Success with endpoint: ${endpoint}`);
          return response;
        } catch (error: any) {
          console.log(`[ApiService] Failed endpoint ${endpoint}:`, error?.response?.status || 'No status');
          continue;
        }
      }

      throw new Error('All endpoints failed');

    } catch (error) {
      console.log('[ApiService] getAllProducts completely failed:', error);
      throw error;
    }
  },

  // New search products API
  searchProducts: async (searchTerm: string, options?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    
    if (options?.category) params.append('category', options.category);
    if (options?.minPrice) params.append('minPrice', options.minPrice.toString());
    if (options?.maxPrice) params.append('maxPrice', options.maxPrice.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options?.page) params.append('page', options.page.toString());

    return await api.get(`user/searchProductList?${params.toString()}`);
  },

  // ─────────────────────────────────────────────
  // ORDER TRACKING API FUNCTIONS
  // ─────────────────────────────────────────────
  
  // Get order tracking details
  trackOrder: async (orderId: string): Promise<AxiosResponse<OrderTrackingResponse>> => {
    return await api.get(`user/order/${orderId}/track`);
  },

  // Get order status
  getOrderStatus: async (orderId: string) => {
    return await api.get(`user/order/${orderId}/status`);
  },

  // Driver location update (for driver app)
  updateDriverLocation: async (orderId: string, locationData: LocationUpdatePayload) => {
    return await api.patch(`driver/order/${orderId}/location`, locationData);
  },

  // Driver order status update (for driver app)
  updateOrderStatus: async (orderId: string, status: string) => {
    return await api.patch(`driver/order/${orderId}`, { status });
  },

  // ─────────────────────────────────────────────
  // WEBSOCKET SERVICE FOR REAL-TIME TRACKING
  // ─────────────────────────────────────────────
  
  // WebSocket connection for real-time tracking using React Native WebSocket
  createTrackingSocket: (orderId: string, onLocationUpdate: (data: LocationUpdateEvent) => void, onStatusUpdate: (data: OrderStatusUpdateEvent) => void) => {
    try {
      const wsUrl = BASE_URL.replace('/api', '').replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/tracking?orderId=${orderId}&token=${storage.getToken()}`);

      ws.onopen = () => {
        console.log('WebSocket connected for order tracking:', orderId);
        // Join order-specific room
        ws.send(JSON.stringify({
          type: 'join_order',
          data: { orderId }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'location_update':
              onLocationUpdate(message.data);
              break;
            case 'status_update':
              onStatusUpdate(message.data);
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.log('WebSocket connection error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected from order tracking');
      };

      return ws;
    } catch (error) {
      console.log('WebSocket initialization error:', error);
      return null;
    }
  },

  // Disconnect tracking socket
  disconnectTrackingSocket: (ws: WebSocket | null) => {
    if (ws) {
      ws.close();
      console.log('WebSocket tracking socket disconnected');
    }
  },
};

export default ApiService;
