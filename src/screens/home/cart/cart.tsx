
import React, { useState, useEffect } from "react";
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
} from "react-native";
import CustomBlurView from "../../../components/BlurView/blurView";
import ApiService from "../../../service/apiService";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIsFocused } from "@react-navigation/native";
import cartStyles from "../cart/cart.styles";
import ConfettiCannon from 'react-native-confetti-cannon';
import Toast from 'react-native-toast-message';
import { Images } from "../../../constant";
const styles: any = cartStyles;

const Cart = ({ navigation }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliveryOptions, setSelectedDeliveryOptions] = useState<number[]>([]);
  const [couponSheetVisible, setCouponSheetVisible] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showAppliedDialog, setShowAppliedDialog] = useState(false);
  const [manualCoupon, setManualCoupon] = useState("");
  // Razorpay temporarily disabled; default to COD/wallet only
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "wallet">("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showOrderPlaced, setShowOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
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

  const [totals, setTotals] = useState({
    itemPriceTotal: 0,
    itemMrpTotal: 0,
    handlingCharge: 0,
    deliveryCharge: 0,
    grandTotal: 0,
  });

  const [selectedTip, setSelectedTip] = useState(0);
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

  const effectiveGrandTotal = Math.max(0, (totals.grandTotal || 0) - couponDiscount);
  const payableAmount = effectiveGrandTotal + selectedTip;

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

  // FETCH CART
  const fetchCart = async () => {
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
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchCart();
      fetchAddresses();
      fetchWalletBalance();
    }
  }, [isFocused]);

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

  // FETCH WALLET BALANCE (direct balance endpoint with fallbacks)
  const fetchWalletBalance = async () => {
    try {
      const response = await ApiService.getWalletBalance();
      if (response?.data?.success) {
        const data = response.data?.data;
        if (typeof data === "number") {
          setWalletBalance(data);
          return;
        }
        if (data?.balance !== undefined) {
          setWalletBalance(data.balance);
          return;
        }
        if (data?.currentBalance !== undefined) {
          setWalletBalance(data.currentBalance);
          return;
        }
      }

      // Fallback to history if balance not present
      try {
        const historyRes = await ApiService.getWalletHistory();
        if (historyRes?.data?.success && historyRes.data.data) {
          const historyData = historyRes.data.data;
          let currentBalance = 0;
          if (Array.isArray(historyData) && historyData.length > 0) {
            const sorted = [...historyData].sort((a, b) => {
              const aTime = new Date(a.createdAt).getTime();
              const bTime = new Date(b.createdAt).getTime();
              return bTime - aTime;
            });
            currentBalance = sorted[0].balance_after_action || 0;
          } else if (historyData.walletHistory && historyData.walletHistory.length > 0) {
            const sorted = [...historyData.walletHistory].sort((a, b) => {
              const aTime = new Date(a.createdAt).getTime();
              const bTime = new Date(b.createdAt).getTime();
              return bTime - aTime;
            });
            currentBalance = sorted[0].balance_after_action || 0;
          } else if (historyData.transactions && historyData.transactions.length > 0) {
            const sorted = [...historyData.transactions].sort((a, b) => {
              const aTime = new Date(a.createdAt).getTime();
              const bTime = new Date(b.createdAt).getTime();
              return bTime - aTime;
            });
            currentBalance = sorted[0].balance_after_action || 0;
          }
          setWalletBalance(currentBalance);
          return;
        }
      } catch (err) {
        console.log("Wallet history fallback error:", err);
      }

      setWalletBalance(0);
    } catch (error) {
      console.log("Wallet balance fetch error:", error);
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
    if (!addressForm.houseNoOrFlatNo || !addressForm.city || !addressForm.pincode || !addressForm.receiverName || !addressForm.receiverNo) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields",
      });
      return;
    }
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

  // UPDATE QUANTITY
  const updateQuantity = async (item: any, delta: number) => {
    const newQuantity = (item.quantity || 0) + delta;

    if (newQuantity <= 0) {
      return removeItem(item.variantId?._id || "", item.productId._id);
    }

    // Optimistically update UI and totals so price changes immediately
    const unitPrice = Number(item.price || item.variantId?.price || 0);
    const unitMrp = Number(item.mrp || item.variantId?.mrp || unitPrice);
    const deltaPrice = unitPrice * delta;
    const deltaMrp = unitMrp * delta;

    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id ? { ...i, quantity: newQuantity } : i
      )
    );

    setTotals((prev) => {
      const nextItemPriceTotal = Math.max(0, Number(prev.itemPriceTotal || 0) + deltaPrice);
      const nextItemMrpTotal = Math.max(0, Number(prev.itemMrpTotal || 0) + deltaMrp);
      const grand =
        nextItemPriceTotal +
        Number(prev.handlingCharge || 0) +
        Number(prev.deliveryCharge || 0);
      return {
        ...prev,
        itemPriceTotal: nextItemPriceTotal,
        itemMrpTotal: nextItemMrpTotal,
        grandTotal: grand,
      };
    });

    try {
      await ApiService.addToCart(
        item.productId._id,
        item.variantId?._id || "",
        newQuantity.toString()
      );
      fetchCart();
    } catch (err) {
      fetchCart();
    }
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

      // Use single order endpoint for COD, wallet, Razorpay
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
          <View style={styles.freeDeliveryContainer}>

            <View style={styles.freeDeliveryLeft}>
              <Text style={styles.freeDeliveryText}>
                You're almost there! Add ₹60 and unlock free delivery!
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
              style={styles.browseButton}
              onPress={() => navigation.navigate("Home", { screen: "Dashboard" })}
            >
              <Text style={styles.browseButtonText}>Browse shopping</Text>
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
                    <Text style={styles.itemPrice}>
                      ₹{price * item.quantity}
                    </Text>
                  </View>

                  <View style={{ alignItems: "center", }}>
                    <TouchableOpacity
                      onPress={() => confirmRemoveItem(variant?._id || "", product._id, product?.name)}
                      style={{ padding: 8 }}
                    >
                      <MaterialIcons name="delete-outline" size={22} color="#999" />
                    </TouchableOpacity>

                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f8f8f8",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 30,
                      marginTop: 8,
                    }}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item, -1)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: "#000",
                          justifyContent: "center",
                          alignItems: "center",

                        }}
                      >
                        <Text style={{ fontSize: 18, color: "#000" }}>−</Text>
                      </TouchableOpacity>

                      <Text style={{ marginHorizontal: 16, fontSize: 16, fontWeight: "800", color: "#000" }}>
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(item, +1)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: "#4CAF50",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 18 }}>+</Text>
                      </TouchableOpacity>
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
              <Row label="Delivery Charge" value={`₹${Number(totals.deliveryCharge || 0).toFixed(2)}`} />
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
                        borderColor: isSelected ? "#2E7D32" : "#E0E0E0",
                        marginBottom: 12,
                        marginRight: index % 4 !== 3 ? "2%" : 0,
                      }}
                    >
                      {/* Icon and Checkbox on same line */}
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                        <Icon
                          name={opt.icon}
                          size={20}
                          color={isSelected ? "#2E7D32" : "#555"}
                        />
                        <Icon
                          name={isSelected ? "checkbox-outline" : "square-outline"}
                          size={22}
                          color={isSelected ? "#2E7D32" : "#555"}
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
              <View style={styles.tipButtonsRow}>
                {[10, 20, 30, 50].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setSelectedTip(v)}
                    style={[styles.tipButton, selectedTip === v && styles.selectedTip]}
                  >
                    <Text style={styles.tipText}>₹{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>

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
                        <View style={{ backgroundColor: "#E8F5E9", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#8BC34A" }}>
                          <Text style={{ color: "#2E7D32", fontWeight: "700", fontSize: 12, textTransform: "capitalize" }}>
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
                          backgroundColor: '#1B5E20',
                          borderRadius: 25,
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          alignSelf: "flex-end",
                          marginTop: 8,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                          Changes
                        </Text>
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
                      backgroundColor: '#1B5E20',
                      borderRadius: 25,
                      padding: 14,
                      alignItems: "center",
                      minWidth: 150,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                      + Add Address
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Additional detail input */}
            <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: "#D6E8FF", borderRadius: 10, padding: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: remarkText ? 8 : 0 }}>
                <Text style={{ color: "#000", fontSize: 14, flex: 1 }}>
                  Add any other detail for shop
                </Text>
                <TouchableOpacity
                  onPress={() => setShowRemarkModal(true)}
                  style={{
                    backgroundColor: '#1B5E20',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 25,
                    alignItems: "center",
                    minWidth: 80,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
              {remarkText ? (
                <Text style={{ marginTop: 8, color: "#333", fontSize: 13 }}>
                  {remarkText}
                </Text>
              ) : null}
            </View>

            {/* Payment Method */}
            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>Choose Payment Method</Text>
                <MaterialIcons name="chevron-right" size={20} color="#000" />
              </View>

              {/* Online payment (Razorpay) temporarily disabled until client key is available */}
              <View style={{ paddingVertical: 12 }}>
                <Text style={{ fontSize: 14, color: "#999" }}>
                  Online payment currently unavailable.
                </Text>
              </View>

              {/* Wallet Payment Option */}
              <TouchableOpacity
                onPress={() => {
                  const totalAmount = payableAmount;
                  if (walletBalance < totalAmount) {
                    setShowInsufficientFundsDialog(true);
                  } else {
                    setSelectedPayment("wallet");
                  }
                }}
                disabled={walletBalance < payableAmount}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  opacity: walletBalance < payableAmount ? 0.5 : 1
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <Text style={{ fontSize: 14, color: "#000" }}>Wallet</Text>
                  <Text style={{ fontSize: 12, color: "#666", marginLeft: 8 }}>
                    (Balance: ₹{walletBalance.toFixed(2)})
                  </Text>
                </View>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: walletBalance < payableAmount ? "#ccc" : "#4CAF50",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {selectedPayment === "wallet" && walletBalance >= payableAmount && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" }} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Cash On Delivery Option */}
              <TouchableOpacity
                onPress={() => setSelectedPayment("cod")}
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }}
              >
                <Text style={{ fontSize: 14, color: "#000" }}>Cash On Delivery</Text>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: "#4CAF50",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {selectedPayment === "cod" && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" }} />
                  )}
                </View>
              </TouchableOpacity>

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
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowOrderPlaced(false);
          navigation.navigate("Home", { screen: "Dashboard" });
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}>
          <View style={{ backgroundColor: "#fff", width: "90%", maxWidth: 400, borderRadius: 20, padding: 24, alignItems: "center" }}>
            {/* Success Image */}
            <Image 
              source={Images.success} 
              style={{ width: 200, height: 200, resizeMode: "contain", marginBottom: 20 }}
            />
            
            {/* Title */}
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#000", marginBottom: 8 }}>
              Payment Successful!
            </Text>
            
            {/* Subtitle */}
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 16 }}>
              Your order has been placed
            </Text>
            
            {/* Order ID */}
            {placedOrderId && (
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 24 }}>
                Order ID #{placedOrderId}
              </Text>
            )}
            
            {/* Buttons */}
            <View style={{ width: "100%" }}>
              {/* Track Order Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowOrderPlaced(false);
                  if (placedOrderId) {
                    // Navigate to MyOrder tab first, then to OrderTracking
                    navigation.navigate("MyOrder");
                    setTimeout(() => {
                      navigation.navigate("OrderTracking", { orderId: placedOrderId });
                    }, 100);
                  } else {
                    navigation.navigate("MyOrder");
                  }
                }}
                style={{ 
                  backgroundColor: '#1B5E20', 
                  paddingVertical: 14, 
                  paddingHorizontal: 24, 
                  borderRadius: 30,
                  width: "100%",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Track Order</Text>
              </TouchableOpacity>
              
              {/* Home Page Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowOrderPlaced(false);
                  navigation.navigate("Home", { screen: "Dashboard" });
                }}
                style={{ 
                  backgroundColor: '#1B5E20', 
                  paddingVertical: 14, 
                  paddingHorizontal: 24, 
                  borderRadius: 30,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Home Page</Text>
              </TouchableOpacity>
            </View>
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
        onRequestClose={() => setShowAddAddressModal(false)}
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
              <TouchableOpacity onPress={() => setShowAddAddressModal(false)} style={{ paddingRight: 10 }}>
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
                  onChangeText={(text) => setAddressForm({ ...addressForm, receiverNo: text })}
                  keyboardType="phone-pad"
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
                  onChangeText={(text) => setAddressForm({ ...addressForm, pincode: text })}
                  keyboardType="number-pad"
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
                  backgroundColor: '#1B5E20',
                  borderRadius: 25,
                  padding: 14,
                  alignItems: "center",
                  marginTop: 8,
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  + Add New Address
                </Text>
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
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderColor: "#ddd",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          elevation: 10,
        }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
            ₹{payableAmount.toFixed(2)}
          </Text>
          <TouchableOpacity
            disabled={placingOrder}
            onPress={placeOrder}
            style={{
              backgroundColor: '#1B5E20',
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 25,
              opacity: placingOrder ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {placingOrder ? "Placing..." : "Place Order"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

type RowProps = { label: string; value: string; bold?: boolean; fontSize?: number };
const Row = ({ label, value, bold, fontSize }: RowProps) => (
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