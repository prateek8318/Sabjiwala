
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  Vibration,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import CustomBlurView from "../../../components/BlurView/blurView";
import ApiService from "../../../service/apiService";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import cartStyles from "../cart/cart.styles";
import ConfettiCannon from 'react-native-confetti-cannon';
import Toast from 'react-native-toast-message';
import { Images, RazorpayConfig } from "../../../constant";
import RazorpayCheckout from 'react-native-razorpay';
const styles: any = cartStyles;

const Cart = ({ navigation }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliveryOptions, setSelectedDeliveryOptions] = useState<number[]>([]);
  const [couponSheetVisible, setCouponSheetVisible] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showAppliedDialog, setShowAppliedDialog] = useState(false);
  const [manualCoupon, setManualCoupon] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "wallet" | "razorpay">("cod");
  const [showPaymentSelectionModal, setShowPaymentSelectionModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showOrderPlaced, setShowOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [minimumCartValue, setMinimumCartValue] = useState(0);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [remainingForFreeDelivery, setRemainingForFreeDelivery] = useState(0);
  const [addressForm, setAddressForm] = useState({
    addressType: "home",
    floor: "",
    houseNoOrFlatNo: "",
    landmark: "",
    pincode: "",
    city: "",
    receiverName: "",
    receiverNo: "",
  });
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<{
    receiverNo?: string;
    pincode?: string;
  }>({});

  const [totals, setTotals] = useState({
    itemPriceTotal: 0,
    itemMrpTotal: 0,
    handlingCharge: 0,
    deliveryCharge: 0,
    grandTotal: 0,
  });

  const [selectedTip, setSelectedTip] = useState(0);
  const [customTip, setCustomTip] = useState<string>('');
  const [showCustomTipInput, setShowCustomTipInput] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showInsufficientFundsDialog, setShowInsufficientFundsDialog] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showAddressSelectionModal, setShowAddressSelectionModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ variantId: string; productId: string; name?: string } | null>(null);
  const isFocused = useIsFocused();

  // Hide bottom tab bar when Cart screen is focused
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' },
        });
      }
      return () => {
        const parent = navigation.getParent();
        if (parent) {
          parent.setOptions({
            tabBarStyle: { 
              display: 'flex',
              height: 80, 
              borderTopWidth: 0, 
              backgroundColor: 'transparent',
              paddingBottom: 8,
              paddingTop: 4,
            }
          });
        }
      };
    }, [navigation])
  );

  // Update cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCart();
      fetchWalletBalance();
      fetchAddresses();
      fetchMinimumCartValue();
    }, [])
  );

  // Fetch minimum cart value for free delivery
  const fetchMinimumCartValue = async () => {
    try {
      const response = await ApiService.get('user/minimumCartValue');
      if (response?.data?.data) {
        setMinimumCartValue(Number(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching minimum cart value:', error);
      // Set a default value in case of error
      setMinimumCartValue(400);
    }
  };

  // Update free delivery status when cart items or minimum cart value changes
  useEffect(() => {
    if (totals.itemPriceTotal >= minimumCartValue) {
      setIsFreeDelivery(true);
      setRemainingForFreeDelivery(0);
    } else {
      setIsFreeDelivery(false);
      setRemainingForFreeDelivery(minimumCartValue - totals.itemPriceTotal);
    }
  }, [totals.itemPriceTotal, minimumCartValue]);

  // Calculate grand total excluding delivery charge when free delivery is active
  const effectiveGrandTotal = isFreeDelivery 
    ? Math.max(0, (totals.itemPriceTotal + totals.handlingCharge || 0) - couponDiscount)
    : Math.max(0, (totals.grandTotal || 0) - couponDiscount);
    
  const payableAmount = effectiveGrandTotal + (selectedTip || 0);

  const formatAddress = (addr: any) => {
    if (!addr) return "";
    const parts: string[] = [];
    if (addr.houseNoOrFlatNo) parts.push(addr.houseNoOrFlatNo);
    if (addr.floor) parts.push(`Floor ${addr.floor}`);
    if (addr.landmark) parts.push(addr.landmark);
    if (addr.city) parts.push(addr.city);
    if (addr.pincode) parts.push(addr.pincode);
    return parts.filter(Boolean).join(", ");
  };

  // FETCH CART - Only used for initial load and manual refresh
  const fetchCart = async (forceUpdate = false) => {
    // Don't fetch if we're already loading or if it's a background refresh
    if (loading && !forceUpdate) return;
    
    try {
      setLoading(true);
      const res = await ApiService.getCart();
      if (res?.data?.success) {
        setItems(res.data.cart?.products || []);
        setTotals({
          itemPriceTotal: res.data.itemPriceTotal || 0,
          itemMrpTotal: res.data.itemMrpTotal || 0,
          handlingCharge: res.data.handlingCharge || 0,
          deliveryCharge: res.data.deliveryCharge || 0,
          grandTotal: res.data.grandTotal || 0,
        });
      } else {
        setItems([]);
      }
    } catch (err) {
      console.log("Cart Fetch Error:", err);
      // Don't clear items on error to prevent UI flicker
    } finally {
      setLoading(false);
    }
  };

  // Initial load and manual refresh
  useEffect(() => {
    if (isFocused) {
      fetchCart(true); // Force update on focus
      fetchAddresses();
      // Fetch wallet balance with a small delay to ensure token is available
      const timer = setTimeout(() => {
        fetchWalletBalance();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);
  
  // Add pull-to-refresh functionality
  const onRefresh = useCallback(() => {
    fetchCart(true); // Force update on pull to refresh
    fetchAddresses();
    fetchWalletBalance();
  }, []);

  // FETCH ADDRESSES
  const fetchAddresses = async () => {
    try {
      const res = await ApiService.getAddresses();
      if (res?.data?.status && res.data.address?.[0]?.addresses) {
        const addressList = res.data.address[0].addresses;
        setAddresses(addressList);
        if (addressList.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addressList[0]._id);
        }
      }
    } catch (err) {
      console.log("Address fetch error:", err);
    }
  };

  // FETCH WALLET BALANCE - Direct API call to get wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await ApiService.get('user/getWalletBalance');
      console.log('Wallet balance response:', JSON.stringify(response, null, 2));
      
      let balance = 0;
      
      if (response?.data?.success) {
        // Try different possible response formats
        const responseData = response.data.data;
        
        if (typeof responseData === 'number') {
          balance = responseData;
        } else if (responseData?.balance !== undefined) {
          balance = Number(responseData.balance);
        } else if (responseData?.currentBalance !== undefined) {
          balance = Number(responseData.currentBalance);
        } else if (typeof responseData === 'object' && responseData !== null) {
          // If data is an object, try to find any numeric value
          const numericValue = Object.values(responseData).find(
            val => typeof val === 'number' && !isNaN(Number(val))
          );
          if (numericValue !== undefined) {
            balance = Number(numericValue);
          }
        }
      }
      
      // Ensure we have a valid number, default to 0 if not
      const finalBalance = isNaN(balance) ? 0 : balance;
      console.log('Setting wallet balance to:', finalBalance);
      setWalletBalance(finalBalance);
      
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    }
  };

  const fetchCoupons = async () => {
    try {
      setCouponLoading(true);
      const res = await ApiService.getCoupons();
      if (res?.data?.status) {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setCoupons(list);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.log("Coupon fetch error:", error);
      setCoupons([]);
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (couponSheetVisible) {
      fetchCoupons();
    }
  }, [couponSheetVisible]);

  const getCouponByCode = (code: string) => {
    if (!code) return null;
    const trimmed = code.trim().toLowerCase();
    return coupons.find((c) => c?.code?.toLowerCase() === trimmed) || null;
  };

  const validateCoupon = (code: string) => {
    if (!code) return { discount: 0, error: null };
    const coupon = getCouponByCode(code);
    if (!coupon) {
      return { discount: 0, error: "Invalid coupon" };
    }

    const baseAmount = Number(totals.itemPriceTotal || 0);
    if (coupon?.minOrderAmount && baseAmount < Number(coupon.minOrderAmount)) {
      return { discount: 0, error: `Min order ₹${coupon.minOrderAmount}` };
    }

    let discount = 0;
    const value = Number(coupon?.discountValue || 0);
    if (coupon.discountType === "percentage") {
      discount = (baseAmount * value) / 100;
    } else {
      discount = value;
    }

    if (coupon?.maxDiscount) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    discount = Math.min(discount, Number(totals.grandTotal || 0));
    if (discount <= 0) {
      return { discount: 0, error: "Coupon not applicable" };
    }
    return { discount, error: null };
  };

  const handleApplyCoupon = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const { discount, error } = validateCoupon(trimmed);
    // If coupon is invalid, do NOT apply it
    if (error || discount <= 0) {
      setAppliedCoupon("");
      setCouponDiscount(0);
      setCouponError(error || "Invalid coupon");
      setCouponSheetVisible(false);
      setManualCoupon("");
      Toast.show({
        type: "error",
        text1: "Coupon Error",
        text2: error || "Invalid coupon",
      });
      return;
    }

    setAppliedCoupon(trimmed);
    setCouponSheetVisible(false);
    setManualCoupon("");
    setCouponDiscount(discount);
    setCouponError(null);
    setShowAppliedDialog(true);
  };

  useEffect(() => {
    if (!appliedCoupon) {
      setCouponDiscount(0);
      setCouponError(null);
      return;
    }
    const { discount, error } = validateCoupon(appliedCoupon);
    setCouponDiscount(discount);
    setCouponError(error);
  }, [appliedCoupon, coupons, totals.itemPriceTotal, totals.grandTotal]);

  // ADD ADDRESS
  const handleAddAddress = async () => {
    // Validate required fields
    if (!addressForm.houseNoOrFlatNo || !addressForm.city || !addressForm.pincode || !addressForm.receiverName || !addressForm.receiverNo) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields",
      });
      return;
    }

    // Validate phone number (must be exactly 10 digits)
    const phoneDigits = addressForm.receiverNo.replace(/[^0-9]/g, '');
    if (phoneDigits.length !== 10) {
      setAddressErrors({ ...addressErrors, receiverNo: "Phone number is incorrect" });
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Phone number is incorrect",
      });
      return;
    }

    // Validate pincode (must be exactly 6 digits)
    const pincodeDigits = addressForm.pincode.replace(/[^0-9]/g, '');
    if (pincodeDigits.length !== 6) {
      setAddressErrors({ ...addressErrors, pincode: "Pincode is incorrect" });
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Pincode is incorrect",
      });
      return;
    }

    // Clear errors if validation passes
    setAddressErrors({});
    try {
      setAddingAddress(true);
      await ApiService.addAddress(addressForm);
      setShowAddAddressModal(false);
      setShowAddressSelectionModal(false);
      setAddressForm({
        addressType: "home",
        floor: "",
        houseNoOrFlatNo: "",
        landmark: "",
        pincode: "",
        city: "",
        receiverName: "",
        receiverNo: "",
      });
      setAddressErrors({});
      await fetchAddresses();
      Toast.show({
        type: "success",
        text1: "Address Added",
        text2: "Address has been added successfully!",
      });
    } catch (err: any) {
      console.log("Add address error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to add address";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setAddingAddress(false);
    }
  };

  // DELETE ADDRESS
  const handleDeleteAddress = async (addressId: string) => {
    try {
      await ApiService.deleteAddress(addressId);
      await fetchAddresses();
      // If deleted address was selected, select first available or clear selection
      if (selectedAddressId === addressId) {
        const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
        if (remainingAddresses.length > 0) {
          setSelectedAddressId(remainingAddresses[0]._id);
        } else {
          setSelectedAddressId(null);
        }
      }
      Toast.show({
        type: "success",
        text1: "Address Deleted",
        text2: "Address has been deleted successfully",
      });
    } catch (err: any) {
      console.log("Delete address error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete address";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    }
  };

  // Delivery option toggle (multi-select)
  const toggleDeliveryOption = (id: number) => {
    setSelectedDeliveryOptions((prev) =>
      prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
    );
  };

  // REMOVE ITEM
  const removeItem = async (variantId: string, productId: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId._id === productId && i.variantId?._id === variantId)
      )
    );

    try {
      await ApiService.removeCartItem(productId, variantId);
      fetchCart();
    } catch (err) {
      fetchCart();
    }
  };

  const confirmRemoveItem = (variantId: string, productId: string, name?: string) => {
    setPendingDelete({ variantId, productId, name });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      removeItem(pendingDelete.variantId, pendingDelete.productId);
    }
    setDeleteModalVisible(false);
    setPendingDelete(null);
  };

  // UPDATE QUANTITY - Optimized with vibration and no page reload
  const updateQuantity = async (item: any, delta: number) => {
    // Add haptic feedback for quantity change
    Vibration.vibrate(30); // Slightly longer vibration for better feedback

    const newQuantity = (item.quantity || 0) + delta;

    if (newQuantity <= 0) {
      // Stronger feedback when removing last item
      Vibration.vibrate([0, 50, 20, 50]); // Double vibration pattern for delete action
      return removeItem(item.variantId?._id || "", item.productId._id);
    }

    // Optimistically update UI and totals so price changes immediately
    const unitPrice = Number(item.price || item.variantId?.price || 0);
    const unitMrp = Number(item.mrp || item.variantId?.mrp || item.variantId?.originalPrice || item.productId?.mrp || unitPrice);

    // Create a copy of current items to avoid direct state mutation
    const updatedItems = items.map((i) =>
      i._id === item._id ? { ...i, quantity: newQuantity } : i
    );

    // Calculate new totals based on updated items
    const newItemPriceTotal = updatedItems.reduce((sum, i) => {
      const price = Number(i.price || i.variantId?.price || 0);
      return sum + (price * (i.quantity || 0));
    }, 0);

    const newItemMrpTotal = updatedItems.reduce((sum, i) => {
      const mrp = Number(i.mrp || i.variantId?.mrp || i.variantId?.originalPrice || i.productId?.mrp || i.price || 0);
      return sum + (mrp * (i.quantity || 0));
    }, 0);

    // Update state in a single batch
    setItems(updatedItems);
    setTotals(prev => ({
      ...prev,
      itemPriceTotal: newItemPriceTotal,
      itemMrpTotal: newItemMrpTotal,
      grandTotal: Math.max(0, newItemPriceTotal + 
        Number(prev.handlingCharge || 0) + 
        Number(prev.deliveryCharge || 0)),
    }));

    // Update server in the background without blocking UI or showing loader
    (async () => {
      try {
        await ApiService.addToCart(
          item.productId._id,
          item.variantId?._id || "",
          newQuantity.toString()
        );
        // Don't call fetchCart here to avoid showing loader
        // Just ensure local state is in sync with server
        const currentItem = items.find(i => i._id === item._id);
        if (currentItem?.quantity !== newQuantity) {
          // Silently update cart data without showing loader
          const res = await ApiService.getCart();
          if (res?.data?.success) {
            setItems(prevItems => {
              // Only update items if there's a mismatch with server
              const serverItems = res.data.cart?.products || [];
              if (JSON.stringify(prevItems) !== JSON.stringify(serverItems)) {
                return serverItems;
              }
              return prevItems;
            });
            setTotals({
              itemPriceTotal: res.data.itemPriceTotal || 0,
              itemMrpTotal: res.data.itemMrpTotal || 0,
              handlingCharge: res.data.handlingCharge || 0,
              deliveryCharge: res.data.deliveryCharge || 0,
              grandTotal: res.data.grandTotal || 0,
            });
          }
        }
      } catch (err) {
        console.log("Error updating cart quantity:", err);
        // On error, just do a silent refresh without showing loader
        try {
          const res = await ApiService.getCart();
          if (res?.data?.success) {
            setItems(res.data.cart?.products || []);
            setTotals({
              itemPriceTotal: res.data.itemPriceTotal || 0,
              itemMrpTotal: res.data.itemMrpTotal || 0,
              handlingCharge: res.data.handlingCharge || 0,
              deliveryCharge: res.data.deliveryCharge || 0,
              grandTotal: res.data.grandTotal || 0,
            });
          }
        } catch (refreshErr) {
          console.log("Error refreshing cart:", refreshErr);
        }
      }
    })();
  };

  const resetCartState = () => {
    setItems([]);
    setTotals({
      itemPriceTotal: 0,
      itemMrpTotal: 0,
      handlingCharge: 0,
      deliveryCharge: 0,
      grandTotal: 0,
    });
    setSelectedTip(0);
  };

  // Razorpay checkout temporarily disabled until client key is provided
  // const startRazorpayPayment = async (amountInRupees: number) => { ... };

  const placeOrder = async () => {
    if (placingOrder) return;
    if (!selectedAddressId) {
      Toast.show({
        type: "error",
        text1: "Address Required",
        text2: "Please select an address",
      });
      return;
    }

    const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId);
    if (!selectedAddress) {
      Toast.show({
        type: "error",
        text1: "Address Error",
        text2: "Selected address could not be found. Please reselect.",
      });
      return;
    }

    const formattedAddress = formatAddress(selectedAddress) || selectedAddress?.address || selectedAddress?.addressLine || "";
    const latFromAddr = selectedAddress.lat || selectedAddress.latitude;
    const longFromAddr = selectedAddress.long || selectedAddress.longitude;

    const totalAmount = payableAmount;
    const isWallet = selectedPayment === "wallet";
    const isRazorpay = selectedPayment === "razorpay";

    if (!totalAmount || totalAmount <= 0) {
      Toast.show({
        type: "error",
        text1: "Payment Error",
        text2: "Amount must be greater than zero",
      });
      return;
    }

    // Check wallet balance if wallet payment is selected
    if (isWallet) {
      if (walletBalance < totalAmount) {
        setShowInsufficientFundsDialog(true);
        return;
      }
    }

    try {
      setPlacingOrder(true);

      // Handle Razorpay payment
      if (isRazorpay) {
        try {
          const orderRes = await ApiService.createRazorpayOrder(totalAmount);
          const orderData = orderRes?.data || {};
          const razorpayOrderId =
            orderData.orderId ||
            orderData.id ||
            orderData?.data?.orderId ||
            orderData?.data?.id;
          const amountPaise =
            orderData.amount ||
            orderData?.data?.amount ||
            Math.round(Number(totalAmount) * 100);
          const currency =
            orderData.currency ||
            orderData?.data?.currency ||
            RazorpayConfig.currency ||
            'INR';

          const payment = await RazorpayCheckout.open({
            key: RazorpayConfig.keyId,
            name: RazorpayConfig.displayName || 'SabjiWala',
            description: 'Order Payment',
            order_id: razorpayOrderId,
            amount: amountPaise,
            currency,
            theme: { color: '#4CAF50' },
            notes: { order_amount: totalAmount.toString() },
          });

          // After successful Razorpay payment, place the order
          const payload: any = {
            addressId: selectedAddressId,
            address: formattedAddress || undefined,
            deliveryAddress: formattedAddress || undefined,
            shippingAddress: formattedAddress || undefined,
            addressLine: formattedAddress || undefined,
            city: selectedAddress?.city,
            pincode: selectedAddress?.pincode,
            lat: latFromAddr || undefined,
            long: longFromAddr || undefined,
            paymentMethod: "razorpay",
            couponCode: appliedCoupon || undefined,
            discountAmount: couponDiscount || 0,
            remark: remarkText ? remarkText : appliedCoupon ? "Applied coupon" : "",
            razorpay_id: payment?.razorpay_payment_id || '',
            razorpay_order_id: razorpayOrderId,
            tipAmount: selectedTip || undefined,
          };

          const orderResponse = await ApiService.placeOrder(payload);
          
          const orderId = 
            orderResponse?.data?.order?._id ||
            orderResponse?.data?.orderId ||
            orderResponse?.data?.data?.order?._id ||
            orderResponse?.data?.data?.orderId ||
            orderResponse?.data?._id ||
            null;
          
          setPlacedOrderId(orderId);
          resetCartState();
          setShowOrderPlaced(true);
          return;
        } catch (err: any) {
          console.log("Razorpay payment failed:", err);
          const errorMessage = err?.message || err?.error?.description || "Payment cancelled or failed";
          if (errorMessage.toLowerCase().includes("cancelled") || errorMessage.toLowerCase().includes("cancel")) {
            Toast.show({
              type: "info",
              text1: "Payment Cancelled",
              text2: "Payment was cancelled. Please try again.",
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Payment Failed",
              text2: errorMessage,
            });
          }
          return;
        } finally {
          setPlacingOrder(false);
        }
      }

      // If wallet, debit balance before creating the order
      if (isWallet) {
        try {
          await ApiService.createWalletHistory({
            amount: totalAmount.toString(),
            action: "debit",
            razorpay_id: `wallet_${Date.now()}`,
            description: "Wallet order debit",
          });
          // Refresh local balance after debit
          await fetchWalletBalance();
        } catch (err: any) {
          console.log("Wallet debit failed:", err);
          const msg = err?.response?.data?.message || err?.message || "Wallet debit failed. Please try another method.";
          Toast.show({
            type: "error",
            text1: "Wallet Error",
            text2: msg,
          });
          return;
        }
      }

      // Use single order endpoint for COD, wallet
      const payload: any = {
        addressId: selectedAddressId,
        // provide address details so backend stores and tracking can display
        address: formattedAddress || undefined,
        deliveryAddress: formattedAddress || undefined,
        shippingAddress: formattedAddress || undefined,
        addressLine: formattedAddress || undefined,
        city: selectedAddress?.city,
        pincode: selectedAddress?.pincode,
        lat: latFromAddr || undefined,
        long: longFromAddr || undefined,
        paymentMethod: selectedPayment,
        couponCode: appliedCoupon || undefined,
        discountAmount: couponDiscount || 0,
        remark: remarkText ? remarkText : appliedCoupon ? "Applied coupon" : "",
        walletPayment: isWallet ? true : undefined,
        walletAmount: isWallet ? totalAmount : undefined,
        tipAmount: selectedTip || undefined,
      };

      // Tag remark to indicate wallet or online usage
      if (isWallet) {
        payload.remark = `${payload.remark || ""} Wallet payment`.trim();
      }

      const orderResponse = await ApiService.placeOrder(payload);
      
      // Extract order ID from response
      const orderId = 
        orderResponse?.data?.order?._id ||
        orderResponse?.data?.orderId ||
        orderResponse?.data?.data?.order?._id ||
        orderResponse?.data?.data?.orderId ||
        orderResponse?.data?._id ||
        null;
      
      setPlacedOrderId(orderId);
      resetCartState();
      setShowOrderPlaced(true);
      // Refresh wallet balance after order placement
      if (selectedPayment === "wallet") {
        await fetchWalletBalance();
      }
    } catch (err: any) {
      console.log("Place order failed:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to place order. Please try again.";
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: errorMessage,
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>

        {/* FREE DELIVERY BANNER */}
        {items.length > 0 && (
          <View style={[
            styles.freeDeliveryContainer,
            isFreeDelivery && { backgroundColor: '#C7E6AB' }
          ]}>
            <View style={styles.freeDeliveryLeft}>
              <Text style={[
                styles.freeDeliveryText,
                isFreeDelivery && { color: '#2E7D32', fontWeight: '700' }
              ]}>
                {isFreeDelivery 
                  ? '🎉 You\'ve unlocked FREE delivery!'
                  : `You're almost there! Add ₹${remainingForFreeDelivery} more to unlock free delivery!`
                }
              </Text>
            </View>

            {/* Delete confirmation modal */}
            <Modal
              transparent
              visible={deleteModalVisible}
              animationType="fade"
              onRequestClose={() => setDeleteModalVisible(false)}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Pressable
                  onPress={(e) => e.stopPropagation()}
                  style={{
                    width: "100%",
                    maxWidth: 380,
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    paddingVertical: 22,
                    paddingHorizontal: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    elevation: 10,
                  }}
                >
                  <View style={{ alignItems: "center", marginBottom: 14 }}>
                    <MaterialIcons name="warning-amber" size={42} color="#E53935" />
                    <Text style={{ marginTop: 10, fontSize: 18, fontWeight: "700", color: "#000" }}>
                      Remove item?
                    </Text>
                    <Text
                      style={{ marginTop: 6, fontSize: 14, color: "#444", textAlign: "center" }}
                      numberOfLines={2}
                    >
                      {pendingDelete?.name
                        ? `Remove "${pendingDelete.name}" from your cart?`
                        : "Remove this item from your cart?"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#E0E0E0",
                        backgroundColor: "#fff",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        setDeleteModalVisible(false);
                        setPendingDelete(null);
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#424242" }}>Keep</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: "#E53935",
                        alignItems: "center",
                      }}
                      onPress={handleConfirmDelete}
                    >
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>


          </View>
        )}


        {/* EMPTY CART */}
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={Images.empty_cart}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>
              Your cart is empty
            </Text>
            <Text style={styles.emptySubtitle}>
              Add items to get started!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Home", { screen: "Dashboard" })}
            >
              <LinearGradient
                colors={["#5A875C", "#015304"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0 }}
                style={styles.browseButton}
              >
                <Text style={styles.browseButtonText}>Browse shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {items.map((item) => {
              const product = item.productId;
              const variant = item.variantId;

              // Fixed Image URL
              const img = product?.images?.[0]
                ? ApiService.getImage(product.images[0])
                : "https://via.placeholder.com/150";

              const price = Number(item.price) || Number(variant?.price) || 0;
              const mrp = Number(item.mrp) || Number(variant?.mrp) || Number(variant?.originalPrice) || Number(product?.mrp) || price;
              const totalPrice = price * item.quantity;
              const totalMrp = mrp * item.quantity;

              return (
                <View key={item._id} style={styles.itemCard}>
                  <Pressable onPress={() => navigation.navigate("ProductDetail", { productId: product._id })}>
                    <Image source={{ uri: img }} style={styles.itemImage} />
                  </Pressable>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.itemWeight}>
                      {variant?.weight || variant?.stock || variant?.name || 1} {variant?.unit}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.itemPrice}>
                        ₹{totalPrice.toFixed(0)}
                      </Text>
                      {mrp > price && (
                        <Text style={styles.itemOriginalPrice}>
                          ₹{totalMrp.toFixed(0)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => confirmRemoveItem(variant?._id || "", product._id, product?.name)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.quantityContainerWrapper}>
                      <LinearGradient
                        colors={['#02214C', '#02568F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.quantityContainerGradient}
                      >
                        <View style={styles.quantityContainer}>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item, -1)}
                            style={styles.quantityButton}
                          >
                            <Text style={styles.quantityButtonText}>−</Text>
                          </TouchableOpacity>

                          <Text style={styles.quantityNumber}>
                            {item.quantity}
                          </Text>

                          <TouchableOpacity
                            onPress={() => updateQuantity(item, +1)}
                            style={styles.quantityButton}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Baki sab same — Coupon, Delivery, Payment, Tip, etc */}
            <TouchableOpacity
              style={styles.couponButton}
              onPress={() => setCouponSheetVisible(true)}
            >
              <Text style={styles.couponText}>See Available Coupons</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#000" />
            </TouchableOpacity>

            {appliedCoupon && (
              <View style={{ marginHorizontal: 16, marginTop: 10, backgroundColor: "#E8F5E9", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="local-offer" size={20} color="#2E7D32" />
                  <Text style={{ marginLeft: 8, fontWeight: "700", color: "#2E7D32" }}>
                    {appliedCoupon}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setAppliedCoupon(null);
                    setCouponDiscount(0);
                    setCouponError(null);
                  }}
                >
                  <MaterialIcons name="close" size={20} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            )}
            {appliedCoupon && (
              <View style={{ marginHorizontal: 16, marginTop: 6 }}>
                {couponError ? (
                  <Text style={{ color: "#C62828", fontSize: 12 }}>{couponError}</Text>
                ) : (
                  <Text style={{ color: "#2E7D32", fontSize: 12 }}>
                    Coupon applied. You save ₹{couponDiscount.toFixed(2)}.
                  </Text>
                )}
              </View>
            )}
            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>Payment Details</Text>
              <Row label="Items Total" value={`₹${Number(totals.itemPriceTotal || 0).toFixed(2)}`} />
              <Row label="Handling Charge" value={`₹${Number(totals.handlingCharge || 0).toFixed(2)}`} />
              <Row 
                label="Delivery Charge" 
                value={isFreeDelivery ? 'FREE' : `₹${Number(totals.deliveryCharge || 0).toFixed(2)}`} 
                style={isFreeDelivery ? { color: '#2E7D32', fontWeight: '600' } : {}}
              />
              {appliedCoupon && (
                <Row label="Coupon Discount" value={`-₹${couponDiscount.toFixed(2)}`} />
              )}
              {selectedTip > 0 && (
                <Row label="Tip" value={`₹${selectedTip.toFixed(2)}`} />
              )}
              <View style={styles.grandTotalRow}>
                <Row
                  bold
                  fontSize={20}
                  label="Grand Total"
                  value={`₹${payableAmount.toFixed(2)}`}
                />

                {/* Including GST - small text below */}
                <Text style={{ fontSize: 10, color: '#555', marginTop: -12, textAlign: 'left' }}>
                  (Including GST)
                </Text>
              </View>

            </View>

            <View style={styles.savingsBox}>
              <Text style={styles.savingsText}>Your Total Saving</Text>
              <Text style={styles.savingsText}>
                ₹{Math.max(0, Number(totals.itemMrpTotal || 0) - Number(totals.itemPriceTotal || 0))}
              </Text>
            </View>
            <View style={{ marginHorizontal: 16, marginTop: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#000" }}>
                Delivery Instructions
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
                {[
                  { id: 1, icon: "call-outline", text: "Avoid calling" },
                  { id: 2, icon: "home-outline", text: "Leave at door" },
                  { id: 3, icon: "shield-checkmark-outline", text: "Leave with guard" },
                  { id: 4, icon: "notifications-off-outline", text: "Don't ring bell" },
                ].map((opt, index) => {
                  const isSelected = selectedDeliveryOptions.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => toggleDeliveryOption(opt.id)}
                      style={{
                        width: "22%",
                        minWidth: 88,
                        maxWidth: 120,
                        alignItems: "center",
                        paddingVertical: 6,
                        paddingHorizontal: 2,
                        borderRadius: 10,
                        backgroundColor: isSelected ? "#C8E6C9" : "#fff",
                        borderWidth: 1,
                        borderColor: isSelected ? "#2E7D32" : "#C7E6AB",
                        marginBottom: 12,
                        marginRight: index % 4 !== 3 ? "2%" : 0,
                      }}
                    >
                      {/* Icon and Checkbox on same line */}
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                        <Icon
                          name={opt.icon}
                          size={20}
                          color={isSelected ? "#2E7D32" : "#015304"}
                        />
                        <Icon
                          name={isSelected ? "checkbox-outline" : "square-outline"}
                          size={22}
                          color={isSelected ? "#015304" : "#C7E6AB"}
                          style={{ marginLeft: 12 }}
                        />
                      </View>
                      {/* Text below */}
                      <Text style={{ fontSize: 14, fontWeight: "600", textAlign: "center", color: "#444" }}>
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>



            <View style={styles.tipBox}>

              <Text style={styles.tipTitle}>Tip Your Delivery partner</Text>

              {/* Description */}
              <Text style={styles.tipDescription}>
                It is a long established fact that a reader will be distracted by the readable content
                of a page when looking at its layout.
              </Text>

              {/* Tip Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tipButtonsRow}
              >
                {[10, 20, 30, 50].map((v) => {
                  const isSelected = !showCustomTipInput && selectedTip === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      onPress={() => {
                        setShowCustomTipInput(false);
                        setCustomTip('');
                        setSelectedTip(v);
                      }}
                      style={[styles.tipButton, isSelected && styles.selectedTip]}
                    >
                      <Text style={styles.tipText}>₹{v}</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Custom Tip Button */}
                <TouchableOpacity
                  onPress={() => {
                    setShowCustomTipInput(true);
                    // keep selectedTip as last custom value or 0; user will change via input
                  }}
                  style={[
                    styles.tipButton,
                    showCustomTipInput && styles.selectedTip,
                  ]}
                >
                  <Text style={styles.tipText}>
                    {showCustomTipInput && customTip ? `₹${customTip}` : 'Custom'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Custom Tip Input */}
              {showCustomTipInput && (
                <View style={styles.customTipRow}>
                  <Text style={styles.customTipLabel}>Enter custom tip</Text>
                  <View style={styles.customTipInputWrapper}>
                    <Text style={styles.customTipPrefix}>₹</Text>
                    <TextInput
                      style={styles.customTipInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={customTip}
                      onChangeText={(text) => {
                        // allow only digits
                        const sanitized = text.replace(/[^0-9]/g, '');
                        setCustomTip(sanitized);
                        const num = Number(sanitized || 0);
                        setSelectedTip(num);
                      }}
                    />
                  </View>
                </View>
              )}

            </View>


            {/* Address Section */}
            <View style={{ marginHorizontal: 16, marginTop: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#000" }}>
                Delivery Address
              </Text>

              {addresses.length > 0 && selectedAddressId ? (
                (() => {
                  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
                  if (!selectedAddress) return null;
                  return (
                    <View style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E2E2E2",
                      padding: 12,
                      marginBottom: 12,
                    }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <View style={{ backgroundColor: "#C7E6AB", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#8BC34A" }}>
                          <Text style={{ color: "#000", fontWeight: "700", fontSize: 12, textTransform: "capitalize" }}>
                            {selectedAddress.addressType}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteAddress(selectedAddress._id)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "#E8F5E9",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MaterialIcons name="delete-outline" size={18} color="#2E7D32" />
                        </TouchableOpacity>
                      </View>
                      <Text style={{ fontSize: 14, color: "#000", fontWeight: "600", marginBottom: 4 }}>
                        {formatAddress(selectedAddress)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowAddressSelectionModal(true)}
                        style={{
                          alignSelf: "flex-end",
                          marginTop: 8,
                          borderRadius: 25,
                          overflow: "hidden",
                        }}
                      >
                        <LinearGradient
                          colors={["#5A875C", "#015304"]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 25,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                            Changes
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  );
                })()
              ) : (
                <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E2E2E2", padding: 16, alignItems: "center" }}>
                  <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                    No address added yet
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddAddressModal(true)}
                    style={{
                      borderRadius: 25,
                      overflow: "hidden",
                      minWidth: 150,
                    }}
                  >
                    <LinearGradient
                      colors={["#5A875C", "#015304"]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        padding: 14,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                        + Add Address
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Additional detail input */}
            <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: "#BAE3FF", borderRadius: 10, padding: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: remarkText ? 8 : 0 }}>
                <Text style={{ color: "#000", fontSize: 14, flex: 1 }}>
                  Add any other detail for shop
                </Text>
                <TouchableOpacity
                  onPress={() => setShowRemarkModal(true)}
                  style={{
                    borderRadius: 25,
                    overflow: "hidden",
                    minWidth: 80,
                  }}
                >
                  <LinearGradient
                    colors={["#5A875C", "#015304"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                      Add
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              {remarkText ? (
                <Text style={{ marginTop: 8, color: "#333", fontSize: 13 }}>
                  {remarkText}
                </Text>
              ) : null}
            </View>

          </>
        )}
      </ScrollView>

      {/* Coupon List Modal - EXACT UI LIKE SCREENSHOT */}
      <Modal
        visible={couponSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCouponSheetVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#fff",
              height: "88%",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <TouchableOpacity onPress={() => setCouponSheetVisible(false)} style={{ paddingRight: 10 }}>
                <Icon name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>Apply Coupon</Text>
            </View>

            {/* Coupon Input */}
            <View style={{ flexDirection: "row", padding: 16 }}>
              <TextInput
                placeholder="Enter Coupon Code"
                placeholderTextColor="#777"
                value={manualCoupon}
                onChangeText={setManualCoupon}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: "#000",
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (!manualCoupon.trim()) return;
                  handleApplyCoupon(manualCoupon.trim());
                }}
                style={{
                  backgroundColor: "#1B5E20",
                  borderRadius: 25,
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  marginLeft: 10,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>APPLY</Text>
              </TouchableOpacity>
            </View>

            {/* Available Coupons Title */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                marginTop: 6,
                marginBottom: 10,
                marginLeft: 16,
                color: "#000",
              }}
            >
              Available Coupon
            </Text>

            {/* Scrollable Coupon List */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            >
              {couponLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <ActivityIndicator color="#4CAF50" />
                  <Text style={{ marginTop: 8, color: "#555" }}>Fetching coupons...</Text>
                </View>
              ) : coupons.length > 0 ? (
                coupons.map((coupon) => {
                  const discountLabel =
                    coupon?.discountType === "percentage"
                      ? `${coupon?.discountValue || 0}% off`
                      : `Flat ₹${coupon?.discountValue || 0} off`;
                  const minOrderText = coupon?.minOrderAmount
                    ? `Min order ₹${coupon.minOrderAmount}`
                    : "No minimum order";
                  const validityText = coupon?.expiryDate
                    ? `Valid till ${new Date(coupon.expiryDate).toLocaleDateString()}`
                    : null;

                  return (
                    <View
                      key={coupon?._id || coupon?.code}
                      style={{
                        backgroundColor: "#E2EBC4",
                        borderRadius: 12,
                        padding: 12,
                        flexDirection: "row",
                        marginBottom: 16,
                      }}
                    >
                      {/* Left Ticket Border */}
                      <View
                        style={{
                          width: 34,
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: "#D5DFAD",
                          }}
                        />
                        <View
                          style={{
                            flex: 1,
                            width: 4,
                            backgroundColor: "#C4D38B",
                            marginVertical: 4,
                            borderRadius: 2,
                          }}
                        />
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: "#D5DFAD",
                          }}
                        />
                      </View>

                      {/* Right Coupon Content */}
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#D5DFAD",
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        {/* Badge */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <Image
                            source={require("../../../assets/images/empty-cart.png")}
                            style={{ width: 18, height: 18, marginRight: 6 }}
                          />
                          <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>
                            {coupon?.code || "COUPON"}
                          </Text>
                        </View>

                        {/* Title */}
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: "#000",
                            marginBottom: 6,
                          }}
                        >
                          {discountLabel}
                        </Text>

                        {/* Description */}
                        <Text
                          numberOfLines={3}
                          style={{
                            fontSize: 11,
                            color: "#444",
                            lineHeight: 14,
                          }}
                        >
                          {minOrderText}
                          {validityText ? ` • ${validityText}` : ""}
                        </Text>

                        {/* APPLY Button */}
                        <TouchableOpacity
                          onPress={() => {
                            if (!coupon?.code) return;
                            handleApplyCoupon(coupon.code);
                          }}
                          style={{
                            marginTop: 10,
                            backgroundColor: "#1B5E20",
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 25,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>APPLY</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Text style={{ color: "#555" }}>No coupons available right now.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAppliedDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAppliedDialog(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>

          {/* Left side party popper */}
          <ConfettiCannon count={80} origin={{ x: -40, y: 0 }} autoStart={true} fadeOut={true} />

          {/* Right side party popper */}
          <ConfettiCannon count={80} origin={{ x: 400, y: 0 }} autoStart={true} fadeOut={true} />

          <View style={{ backgroundColor: "#fff", width: "78%", borderRadius: 12, padding: 18, alignItems: "center" }}>
            <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center" }}>
              <Icon name="checkmark" size={30} color="#fff" />
            </View>
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "800", color: "#000" }}>
              {appliedCoupon || "COUPON"}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 14, fontWeight: "700", color: "#000" }}>Wohooo!</Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: "#555" }}>Applied Successfully</Text>
            <TouchableOpacity
              onPress={() => setShowAppliedDialog(false)}
              style={{ marginTop: 16, backgroundColor: "#1B5E20", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order Placed Dialog */}
      <Modal
        visible={showOrderPlaced}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowOrderPlaced(false);
          navigation.navigate("Home", { screen: "Dashboard" });
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 24 }}>
          {/* Success Image */}
          <Image 
            source={Images.success} 
            style={{ width: 250, height: 250, resizeMode: "contain", marginBottom: 20 }}
          />
          
          {/* Title */}
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#015304", marginBottom: 12, textAlign: 'center' }}>
            Order Successful!
          </Text>
          
          {/* Subtitle */}
          <Text style={{ fontSize: 18, color: "#015304", textAlign: "center", marginBottom: 24, paddingHorizontal: 20 }}>
            Your order has been placed successfully!
          </Text>
          
          {/* Order ID */}
          {placedOrderId && (
            <View style={{ backgroundColor: '#F5F5F5', padding: 16, borderRadius: 12, marginBottom: 32, width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: "#015304", marginBottom: 4 }}>Order ID</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#015304" }}>#{placedOrderId}</Text>
            </View>
          )}
          
          {/* Buttons */}
          <View style={{ width: "100%", paddingHorizontal: 16, position: 'absolute', bottom: 40 }}>
            {/* Track Order Button */}
            <LinearGradient
              colors={["#5A875C", "#015304"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ 
                paddingVertical: 2, 
                borderRadius: 30,
                width: "100%",
                marginBottom: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowOrderPlaced(false);
                  if (placedOrderId) {
                    navigation.navigate("MyOrder");
                    setTimeout(() => {
                      navigation.navigate("OrderTracking", { orderId: placedOrderId });
                    }, 100);
                  } else {
                    navigation.navigate("MyOrder");
                  }
                }}
                style={{ 
                  paddingVertical: 14, 
                  borderRadius: 30,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Track Order</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            {/* Home Page Button */}
            <TouchableOpacity
              onPress={() => {
                setShowOrderPlaced(false);
                navigation.navigate("Home", { screen: "Dashboard" });
              }}
              style={{ 
                backgroundColor: '#fff', 
                paddingVertical: 14, 
                borderRadius: 30,
                width: "100%",
                alignItems: "center",
                borderWidth: 1,
                borderColor: '#015304',
              }}
            >
              <Text style={{ color: "#1B5E20", fontWeight: "700", fontSize: 16 }}>Home Page</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Insufficient Funds Dialog */}
      <Modal
        visible={showInsufficientFundsDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInsufficientFundsDialog(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
          <View style={{ backgroundColor: "#fff", width: "80%", borderRadius: 14, padding: 20, alignItems: "center" }}>
            <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "#FF9800", alignItems: "center", justifyContent: "center" }}>
              <Icon name="warning" size={30} color="#fff" />
            </View>
            <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "800", color: "#000" }}>
              Insufficient Funds
            </Text>
            <Text style={{ marginTop: 6, fontSize: 14, color: "#555", textAlign: "center" }}>
              Your wallet balance (₹{walletBalance.toFixed(2)}) is insufficient to pay for this order (₹{payableAmount.toFixed(2)}).
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: "#555", textAlign: "center" }}>
              Please choose another payment method.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowInsufficientFundsDialog(false);
                setSelectedPayment("cod");
              }}
              style={{ marginTop: 16, backgroundColor: "#1B5E20", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, width: "100%" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>Choose COD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowInsufficientFundsDialog(false)}
              style={{ marginTop: 12, paddingVertical: 8 }}
            >
              <Text style={{ color: "#666", fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Remark Modal */}
      <Modal
        visible={showRemarkModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemarkModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowRemarkModal(false)}>
          <View style={{ flex: 1 }}>
            <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}>
              <CustomBlurView />
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: "rgba(0,0,0,0.35)",
                }}
                pointerEvents="none"
              />
            </View>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", zIndex: 2 }}>
              <TouchableWithoutFeedback>
                <View style={{ backgroundColor: "#fff", width: "84%", borderRadius: 12, padding: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 10 }}>
                    Add Your remark here.
                  </Text>
                  <TextInput
                    value={remarkText}
                    onChangeText={setRemarkText}
                    placeholder="Type your remark..."
                    placeholderTextColor="#888"
                    multiline
                    style={{
                      minHeight: 140,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderStyle: "dashed",
                      borderRadius: 10,
                      padding: 12,
                      textAlignVertical: "top",
                      color: "#000",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowRemarkModal(false)}
                    activeOpacity={0.8}
                    style={{
                      marginTop: 16,
                      backgroundColor: "#1B5E20",
                      borderRadius: 25,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        visible={showAddAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddAddressModal(false);
          setAddressErrors({});
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#fff",
              height: "90%",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <TouchableOpacity onPress={() => {
                setShowAddAddressModal(false);
                setAddressErrors({});
              }} style={{ paddingRight: 10 }}>
                <Icon name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>Add New Address</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Address Type */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>Address Type *</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {["home", "office", "other"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setAddressForm({ ...addressForm, addressType: type })}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: addressForm.addressType === type ? "#E8F5E9" : "#F4F4F4",
                        borderWidth: addressForm.addressType === type ? 2 : 1,
                        borderColor: addressForm.addressType === type ? "#4CAF50" : "#ddd",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: addressForm.addressType === type ? "#2E7D32" : "#666", fontWeight: "600", textTransform: "capitalize" }}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Receiver Name */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>Receiver Name *</Text>
                <TextInput
                  placeholder="Enter receiver name"
                  placeholderTextColor="#999"
                  value={addressForm.receiverName}
                  onChangeText={(text) => setAddressForm({ ...addressForm, receiverName: text })}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#000",
                  }}
                />
              </View>

              {/* Receiver Number */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>Receiver Number *</Text>
                <TextInput
                  placeholder="Enter receiver number"
                  placeholderTextColor="#999"
                  value={addressForm.receiverNo}
                  onChangeText={(text) => {
                    // Only allow digits and limit to 10
                    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 10);
                    setAddressForm({ ...addressForm, receiverNo: digitsOnly });
                    // Clear error when user types
                    if (addressErrors.receiverNo) {
                      setAddressErrors({ ...addressErrors, receiverNo: undefined });
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={{
                    borderWidth: 1,
                    borderColor: addressErrors.receiverNo ? "#FF3B30" : "#ddd",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#000",
                  }}
                />
                {addressErrors.receiverNo && (
                  <Text style={{ color: "#FF3B30", fontSize: 12, marginTop: 4 }}>
                    {addressErrors.receiverNo}
                  </Text>
                )}
              </View>

              {/* House/Flat No */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>House/Flat No *</Text>
                <TextInput
                  placeholder="Enter house/flat number"
                  placeholderTextColor="#999"
                  value={addressForm.houseNoOrFlatNo}
                  onChangeText={(text) => setAddressForm({ ...addressForm, houseNoOrFlatNo: text })}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#000",
                  }}
                />
              </View>

              {/* Floor */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>Floor</Text>
                <TextInput
                  placeholder="Enter floor (optional)"
                  placeholderTextColor="#999"
                  value={addressForm.floor}
                  onChangeText={(text) => setAddressForm({ ...addressForm, floor: text })}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#000",
                  }}
                />
              </View>

              {/* Landmark */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>Landmark</Text>
                <TextInput
                  placeholder="Enter landmark (optional)"
                  placeholderTextColor="#999"
                  value={addressForm.landmark}
                  onChangeText={(text) => setAddressForm({ ...addressForm, landmark: text })}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#000",
                  }}
                />
              </View>

              {/* City */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>City *</Text>
                <TextInput
                  placeholder="Enter city"
                  placeholderTextColor="#999"
                  value={addressForm.city}
                  onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#000",
                  }}
                />
              </View>

              {/* Pincode */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 8 }}>Pincode *</Text>
                <TextInput
                  placeholder="Enter pincode"
                  placeholderTextColor="#999"
                  value={addressForm.pincode}
                  onChangeText={(text) => {
                    // Only allow digits and limit to 6
                    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setAddressForm({ ...addressForm, pincode: digitsOnly });
                    // Clear error when user types
                    if (addressErrors.pincode) {
                      setAddressErrors({ ...addressErrors, pincode: undefined });
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    borderWidth: 1,
                    borderColor: addressErrors.pincode ? "#FF3B30" : "#ddd",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#000",
                  }}
                />
                {addressErrors.pincode && (
                  <Text style={{ color: "#FF3B30", fontSize: 12, marginTop: 4 }}>
                    {addressErrors.pincode}
                  </Text>
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleAddAddress}
                disabled={addingAddress}
                style={{
                  backgroundColor: addingAddress ? "#ccc" : "#1B5E20",
                  borderRadius: 25,
                  padding: 16,
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {addingAddress ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Save Address</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressSelectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressSelectionModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#fff",
              height: "80%",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setShowAddressSelectionModal(false)} style={{ paddingRight: 10 }}>
                <Icon name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>Select Address</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {addresses.length > 0 ? (
                addresses.map((address) => {
                  const isSelected = selectedAddressId === address._id;
                  return (
                    <TouchableOpacity
                      key={address._id}
                      onPress={() => {
                        setSelectedAddressId(address._id);
                        setShowAddressSelectionModal(false);
                      }}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? "#4CAF50" : "#E2E2E2",
                        padding: 12,
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ backgroundColor: "#E8F5E9", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#8BC34A" }}>
                            <Text style={{ color: "#2E7D32", fontWeight: "700", fontSize: 12, textTransform: "capitalize" }}>
                              {address.addressType}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={{ marginLeft: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center" }}>
                              <Icon name="checkmark" size={14} color="#fff" />
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={{ marginTop: 8, fontSize: 14, color: "#000", fontWeight: "600" }}>
                        {address.receiverName} - {address.receiverNo}
                      </Text>
                      <Text style={{ marginTop: 4, fontSize: 14, color: "#666" }}>
                        {formatAddress(address)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Text style={{ color: "#555", marginBottom: 16 }}>No saved addresses</Text>
                </View>
              )}

              {/* Add New Address Button */}
              <TouchableOpacity
              onPress={() => {
                setShowAddressSelectionModal(false);
                setShowAddAddressModal(true);
              }}
              style={{
                borderRadius: 25,
                overflow: "hidden",
                alignItems: "center",
                marginTop: 8,
                marginBottom: 20,
              }}
            >
              <LinearGradient
                colors={["#5A875C", "#015304"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0 }}
                style={{
                  padding: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 25,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  + Add New Address
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* BOTTOM BAR */}
      {items.length > 0 && (
        <View style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderColor: "#ddd",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          elevation: 10,
          gap: 12,
        }}>
          {/* Payment Method Selector */}
          <TouchableOpacity
            onPress={() => setShowPaymentSelectionModal(true)}
            style={{
              width: '43%',
              backgroundColor: "#E3F2FD",
              borderRadius: 25,
              paddingVertical: 10,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 48,
              marginRight: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#1565C0", marginRight: 6 }}>
                  PAY USING
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={16} color="#1565C0" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#000" }}>
                {selectedPayment === "wallet" ? "Wallet" : selectedPayment === "razorpay" ? "Razorpay" : "Cash On Delivery"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Place Order Button */}
          <TouchableOpacity
            disabled={placingOrder}
            onPress={placeOrder}
            style={{
            
              width: '47%',
              borderRadius: 25,
              paddingVertical: 10,
              overflow: "hidden",
              minHeight: 50,
            }}
          >
            <LinearGradient
              colors={["#5A875C", "#015304"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 18,
                paddingHorizontal: 14,
                borderRadius: 25,
                opacity: placingOrder ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
                  ₹{payableAmount.toFixed(0)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "500" }}>
                    {placingOrder ? "Placing..." : "Place Order"}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

     
      {/* Payment Selection Modal */}
<Modal
  visible={showPaymentSelectionModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowPaymentSelectionModal(false)}
>
  <SafeAreaView style={{ flex: 1 }}>
    <TouchableOpacity
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
      activeOpacity={1}
      onPress={() => setShowPaymentSelectionModal(false)}
    >
      <View style={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "85%", // थोड़ा बढ़ाया
        minHeight: "60%", // कम से कम इतना space
        marginTop: "auto",
        overflow: "hidden",
      }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E0E0E0",
          }}
        >
          <TouchableOpacity
            onPress={() => setShowPaymentSelectionModal(false)}
            style={{ paddingRight: 12 }}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>
            Select Payment Method
          </Text>
        </View>

        {/* ScrollView */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            paddingBottom: 40, // नीचे extra space
          }}
        >
          {/* Wallet Option */}
          <TouchableOpacity
            onPress={() => {
              if (walletBalance >= payableAmount) {
                setSelectedPayment("wallet");
                setShowPaymentSelectionModal(false);
              } else {
                setShowInsufficientFundsDialog(true);
                setShowPaymentSelectionModal(false);
              }
            }}
            disabled={walletBalance < payableAmount}
            style={{
              backgroundColor: "#E3F2FD",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: walletBalance < payableAmount ? 0.5 : 1,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#4CAF50",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 4 }}>
                  NCR Wallet
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Balance: ₹{walletBalance.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: walletBalance < payableAmount ? "#ccc" : "#015304",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {selectedPayment === "wallet" && walletBalance >= payableAmount && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#015304" }} />
              )}
            </View>
          </TouchableOpacity>

          {/* Cash On Delivery Option */}
          <TouchableOpacity
            onPress={() => {
              setSelectedPayment("cod");
              setShowPaymentSelectionModal(false);
            }}
            style={{
              backgroundColor: "#E3F2FD",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#4CAF50",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}>
                <MaterialIcons name="money" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>
                  Cash On Delivery
                </Text>
              </View>
            </View>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#015304",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {selectedPayment === "cod" && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#015304" }} />
              )}
            </View>
          </TouchableOpacity>

          {/* Razorpay Option */}
          <TouchableOpacity
            onPress={() => {
              setSelectedPayment("razorpay");
              setShowPaymentSelectionModal(false);
            }}
            style={{
              backgroundColor: "#E3F2FD",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#4CAF50",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}>
                <MaterialIcons name="payment" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>
                  Razorpay
                </Text>
              </View>
            </View>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#015304",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {selectedPayment === "razorpay" && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#015304" }} />
              )}
            </View>
          </TouchableOpacity>

          {/* Other payment options (disabled) */}
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#999", marginBottom: 8 }}>
              Other Payment Methods (Unavailable)
            </Text>
            {/* Paytm UPI */}
            <View style={{
              backgroundColor: "#F5F5F5",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: 0.5,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#ccc",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#666" }}>UPI</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#999" }}>
                  Paytm UPI
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </View>
            {/* Google Pay UPI */}
            <View style={{
              backgroundColor: "#F5F5F5",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: 0.5,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#ccc",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#666" }}>GP</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#999" }}>
                  Google Pay UPI
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableOpacity>
  </SafeAreaView>
</Modal>
      
    </SafeAreaView>
  );
};

interface RowProps {
  label: string;
  value: string;
  bold?: boolean;
  fontSize?: number;
  style?: any;
};
const Row = ({ label, value, bold, fontSize = 14, style = {} }: RowProps) => (
  <View style={styles.paymentRow}>
    <Text style={{ fontSize: fontSize || (bold ? 18 : 16), fontWeight: bold ? "700" : "500", color: "#000" }}>
      {label}
    </Text>
    <Text style={{ fontSize: fontSize ? fontSize + 2 : (bold ? 20 : 16), fontWeight: bold ? "700" : "500", color: bold ? "#2E7D32" : "#000" }}>
      {value}
    </Text>
  </View>
);

export default Cart;