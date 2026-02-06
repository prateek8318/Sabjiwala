export type AuthStackProps = {
  Signin: undefined;
  VerifyOTP:any;
  LocationPermission:undefined
  SearchLocation:undefined;
  AddAddress:undefined;
  TermsCondition: undefined;
  PrivacyPolicy: undefined;
};

export type HomeStackProps = {
  Dashboard: undefined;
  Catogaries:undefined;
  Products:any;
  ProductDetail:undefined;
  ExploreListing: { exploreSectionId: string; exploreSectionName?: string };
  Search: undefined;
  Profile: undefined;
  EditProfile:undefined;
  Wallet:undefined;
  Notifications:undefined;
  Address:undefined;
  EditAddress:undefined;
  ReferEarn:undefined;
  PrivacyPolicy:undefined;
  TermsCondition:undefined;
  Support:undefined;
  AboutUs:undefined;
  InviteFriend:undefined;
  BottomStackNavigator:undefined
  AddAddress: undefined;
};

export interface HomeApiResponse {
  success: boolean;
  message: string;
  data: {
    dealOfTheDay: Product[];
    recommendedProducts: Product[];
    favoriteProducts: Product[];
    freshFoodProducts: Product[];
  };
}


export interface Variant {
  _id: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock?: number;
  unit?: string;
  images?: string[];
}

export interface Product {
  _id: string;
  productName: string;
  primary_image: string[];
  price?: number;
  mrp?: number;
  ProductVarient: Variant[];
  rating: number;
  distance: string;
  time: string;
}


// export interface Product {
//   _id: string;
//   name: string;
//   price?: number;
//   mrp?: number;
//   images?: string[];
//   variants: Variant[];
// }

export interface SubCategory {
  _id: string;
  name: string;
  image?: string;
}

export interface ProductCardItem {
  id: string;
  name: string;
  image: string;
  images?: string[];
  price: number;
  oldPrice: number;
  discount: string;
  weight: string;
  rating: number;
  options: string;
  variantId?: string;
  ProductVarient?: any[];
}

// Order Details Interfaces
export interface OrderProduct {
  productId: {
    _id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    price: number;
  };
  variantId: {
    _id: string;
    size: string;
    color: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  addressType: string;
  floor: string;
  houseNoOrFlatNo: string;
  landmark: string;
  pincode: string;
  city: string;
  receiverName: string;
  receiverNo: string;
}

export interface CouponUsage {
  couponCode: string;
  discountAmount: number;
  usedAt: string;
}

export interface AssignedDriver {
  _id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
}

export interface OrderDetails {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemPriceTotal: number;
  handlingCharge: number;
  deliveryCharge: number;
  grandTotal: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentStatus: string;
  remark: string;
  status: string;
  couponUsage: CouponUsage[];
  assignedDriver: AssignedDriver;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailsResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
  order?: OrderDetails;
  orders?: OrderDetails[];
}

// Order Tracking Interfaces
export interface DriverVehicle {
  type: string;
  model: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
}

export interface Driver {
  name: string;
  phone: string;
  vehicle: DriverVehicle;
  currentLocation: DriverLocation;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface TimelineEvent {
  status: string;
  title: string;
  completed: boolean;
}

export interface OrderTrackingData {
  orderId: string;
  status: string;
  driver: Driver;
  pickupLocation: Location;
  dropLocation: Location;
  timeline: TimelineEvent[];
  estimatedDelivery: string;
}

export interface OrderTrackingResponse {
  success: boolean;
  data: OrderTrackingData;
}

export interface DriverLocationUpdate {
  latitude: number;
  longitude: number;
  status?: string;
}

export interface LocationUpdatePayload {
  latitude: number;
  longitude: number;
  status: string;
}

// WebSocket Events
export interface LocationUpdateEvent {
  driverLocation: DriverLocation;
  status: string;
  orderId: string;
}

export interface OrderStatusUpdateEvent {
  status: string;
  orderId: string;
  timestamp: string;
}
