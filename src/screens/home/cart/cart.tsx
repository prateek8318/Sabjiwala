
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import ApiService from "../../../service/apiService";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIsFocused } from "@react-navigation/native";
import styles from "../cart/cart.styles";

const Cart = ({ navigation }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliveryOptions, setSelectedDeliveryOptions] = useState<number[]>([]);
  const [couponSheetVisible, setCouponSheetVisible] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showAppliedDialog, setShowAppliedDialog] = useState(false);
  const [manualCoupon, setManualCoupon] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showOrderPlaced, setShowOrderPlaced] = useState(false);
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
  const isFocused = useIsFocused();

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

  // ADD ADDRESS
  const handleAddAddress = async () => {
    if (!addressForm.houseNoOrFlatNo || !addressForm.city || !addressForm.pincode || !addressForm.receiverName || !addressForm.receiverNo) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    try {
      setAddingAddress(true);
      await ApiService.addAddress(addressForm);
      setShowAddAddressModal(false);
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
    } catch (err: any) {
      console.log("Add address error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to add address";
      Alert.alert("Error", errorMessage);
    } finally {
      setAddingAddress(false);
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

  // UPDATE QUANTITY
  const updateQuantity = async (item: any, delta: number) => {
    const newQuantity = (item.quantity || 0) + delta;

    if (newQuantity <= 0) {
      return removeItem(item.variantId?._id || "", item.productId._id);
    }

    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id ? { ...i, quantity: newQuantity } : i
      )
    );

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

  const placeOrder = async () => {
    if (placingOrder) return;
    if (!selectedAddressId) {
      Alert.alert("Error", "Please select an address");
      return;
    }
    try {
      setPlacingOrder(true);
      const payload = {
        addressId: selectedAddressId,
        paymentMethod: selectedPayment, // "cod" by default
        couponCode: appliedCoupon || undefined,
        discountAmount: appliedCoupon ? 50 : 0,
        remark: appliedCoupon ? "Applied coupon" : "",
      };

      await ApiService.placeOrder(payload);
      resetCartState();
      setShowOrderPlaced(true);
    } catch (err: any) {
      console.log("Place order failed:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to place order. Please try again.";
      Alert.alert("Error", errorMessage);
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
          <View style={[styles.freeDeliveryBanner, { borderColor: "#8BC34A" }]}>
            <Text style={[styles.freeDeliveryText, { color: "#2E7D32" }]}>
              You're almost there! Add ₹60 and unlock free delivery!
            </Text>
          </View>
        )}

        {/* EMPTY CART */}
        {items.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 }}>
            <Image
              source={require("../../../assets/images/empty-cart.png")} // optional: add image
              style={{ width: 150, height: 150, opacity: 0.5 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 20, color: "#777", marginTop: 20 }}>
              Your cart is empty
            </Text>
            <Text style={{ fontSize: 14, color: "#999", marginTop: 8 }}>
              Add items to get started!
            </Text>
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
                  <Image source={{ uri: img }} style={styles.itemImage} />

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
                      onPress={() => removeItem(variant?._id || "", product._id)}
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
                <TouchableOpacity onPress={() => setAppliedCoupon(null)}>
                  <MaterialIcons name="close" size={20} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            )}

            <View style={{ marginHorizontal: 16, marginTop: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
                Delivery Instructions
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", rowGap: 12 }}>
                {[
                  { id: 1, icon: "call-outline", text: "Avoid calling" },
                  { id: 2, icon: "home-outline", text: "Leave at door" },
                  { id: 3, icon: "shield-checkmark-outline", text: "Leave with guard" },
                  { id: 4, icon: "notifications-off-outline", text: "Don't ring bell" },
                ].map((opt) => {
                  const isSelected = selectedDeliveryOptions.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => toggleDeliveryOption(opt.id)}
                      style={{
                        width: "22%",
                        minWidth: 88,
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        backgroundColor: isSelected ? "#C8E6C9" : "#F4F4F4",
                        borderWidth: isSelected ? 1 : 0,
                        borderColor: isSelected ? "#2E7D32" : "transparent",
                      }}
                    >
                      <Icon
                        name={isSelected ? "checkbox-outline" : "square-outline"}
                        size={22}
                        color={isSelected ? "#2E7D32" : "#555"}
                      />
                      <Icon
                        name={opt.icon}
                        size={20}
                        color={isSelected ? "#2E7D32" : "#555"}
                        style={{ marginTop: 6 }}
                      />
                      <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "600", textAlign: "center", color: "#444" }}>
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>Payment Details</Text>
              <Row label="Items Total" value={`₹${totals.itemPriceTotal}`} />
              <Row label="Handling Charge" value={`₹${totals.handlingCharge}`} />
              <Row label="Delivery Charge" value={`₹${totals.deliveryCharge}`} />
              <View style={styles.grandTotalRow}>
                <Row bold label="Grand Total" value={`₹${totals.grandTotal + selectedTip}`} />
              </View>
            </View>

            <View style={styles.savingsBox}>
              <Text style={styles.savingsText}>Your Total Saving</Text>
              <Text style={styles.savingsText}>
                ₹{totals.itemMrpTotal - totals.itemPriceTotal}
              </Text>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Tip Your Delivery Partner</Text>
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
              
              {addresses.length > 0 ? (
                addresses.map((address) => {
                  const isSelected = selectedAddressId === address._id;
                  return (
                    <TouchableOpacity
                      key={address._id}
                      onPress={() => setSelectedAddressId(address._id)}
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
                        {address.houseNoOrFlatNo}, {address.floor && `Floor ${address.floor}, `}
                        {address.landmark && `${address.landmark}, `}
                        {address.city} - {address.pincode}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E2E2E2", padding: 16, alignItems: "center" }}>
                  <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                    No address added yet
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setShowAddAddressModal(true)}
                style={{
                  backgroundColor: "#4CAF50",
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  + Add Address
                </Text>
              </TouchableOpacity>
            </View>

            {/* Additional detail input (static) */}
            <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: "#D6E8FF", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ flex: 1, color: "#000", fontSize: 14 }}>
                Add any other detail for shop
              </Text>
              <TouchableOpacity style={{ backgroundColor: "#4CAF50", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>Choose Payment Method</Text>
                <MaterialIcons name="chevron-right" size={20} color="#000" />
              </View>
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
                  setAppliedCoupon(manualCoupon.trim());
                  setCouponSheetVisible(false);
                  setShowAppliedDialog(true);
                }}
                style={{
                  backgroundColor: "#4CAF50",
                  borderRadius: 8,
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
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
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
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>Kotak</Text>
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
                      Get Flat 10% Discount with select Kotak credit.
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
                      It is a long established fact that a reader will be distracted by the readable
                      content of a page when looking at its layout.
                    </Text>

                    {/* APPLY Button */}
                    <TouchableOpacity
                      onPress={() => {
                        setAppliedCoupon("NCRKOTAKCC");
                        setCouponSheetVisible(false);
                        setShowAppliedDialog(true);
                      }}
                      style={{
                        marginTop: 10,
                        backgroundColor: "#4CAF50",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>APPLY</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Coupon Applied Dialog */}
      <Modal
        visible={showAppliedDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAppliedDialog(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
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
              style={{ marginTop: 16, backgroundColor: "#4CAF50", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}
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
          navigation.navigate("MyOrder");
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
          <View style={{ backgroundColor: "#fff", width: "80%", borderRadius: 14, padding: 20, alignItems: "center" }}>
            <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center" }}>
              <Icon name="checkmark" size={30} color="#fff" />
            </View>
            <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "800", color: "#000" }}>
              Order Placed!
            </Text>
            <Text style={{ marginTop: 6, fontSize: 14, color: "#555", textAlign: "center" }}>
              Your order has been placed successfully.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowOrderPlaced(false);
                navigation.navigate("MyOrder");
              }}
              style={{ marginTop: 16, backgroundColor: "#4CAF50", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Go to My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
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
                  backgroundColor: addingAddress ? "#ccc" : "#4CAF50",
                  borderRadius: 12,
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
            ₹{totals.grandTotal + selectedTip}
          </Text>
          <TouchableOpacity
            disabled={placingOrder}
            onPress={placeOrder}
            style={{
              backgroundColor: "#4CAF50",
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 12,
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

type RowProps = { label: string; value: string; bold?: boolean };
const Row = ({ label, value, bold }: RowProps) => (
  <View style={styles.paymentRow}>
    <Text style={{ fontSize: 16, fontWeight: bold ? "700" : "500", color: "#000" }}>
      {label}
    </Text>
    <Text style={{ fontSize: bold ? 18 : 16, fontWeight: bold ? "700" : "500", color: bold ? "#2E7D32" : "#000" }}>
      {value}
    </Text>
  </View>
);

export default Cart;