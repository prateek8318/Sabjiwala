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
