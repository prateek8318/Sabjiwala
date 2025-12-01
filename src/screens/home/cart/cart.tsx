/* --- FINAL UPDATED CART PAGE (MATCHES SCREENSHOT) --- */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import ApiService from "../../../service/apiService";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useIsFocused } from "@react-navigation/native";
import styles from "../cart/cart.styles";

const Cart = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState(null);

  const [totals, setTotals] = useState({
    itemPriceTotal: 0,
    itemMrpTotal: 0,
    handlingCharge: 0,
    deliveryCharge: 0,
    grandTotal: 0,
  });

  const [selectedTip, setSelectedTip] = useState(0);
  const isFocused = useIsFocused();

  // ******** FETCH CART ********
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

  // ----------------- AUTO REFRESH ON PAGE LOAD / NAVIGATION -----------------
  useEffect(() => {
    if (isFocused) {
      fetchCart(); // fetch cart whenever this screen comes into focus
    }
  }, [isFocused]);

  // ----------------- REMOVE ITEM -----------------
  const removeItem = async (variantId: string, productId: string) => {
    setItems((prev) =>
      (prev || []).filter(
        (i) => i?.productId && !(i.productId._id === productId && i.variantId?._id === variantId)
      )
    );

    try {
      const res = await ApiService.removeCartItem(productId, variantId);
      if (res.data?.success) {
        fetchCart();
      } else {
        fetchCart();
      }
    } catch (err) {
      console.log("Delete Error:", err);
      fetchCart();
    }
  };

  // ----------------- UPDATE QUANTITY -----------------
  const updateQuantity = async (item, delta: number) => {
    const { productId, variantId, quantity } = item;
    const newQuantity = (quantity || 0) + delta;

    if (newQuantity <= 0) {
      return removeItem(variantId?._id || "", productId?._id || "");
    }

    setItems((prev) =>
      (prev || []).map((i) =>
        i?._id === item._id ? { ...i, quantity: newQuantity } : i
      )
    );

    try {
      await ApiService.addToCart(
        productId?._id || "",
        variantId?._id || "",
        newQuantity.toString()
      );
      fetchCart();
    } catch (err) {
      console.log("AddToCart Error:", err);
      fetchCart();
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
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>

        {/* FREE DELIVERY BANNER */}
        <View style={[styles.freeDeliveryBanner, { borderColor: "#8BC34A" }]}>
          <Text style={[styles.freeDeliveryText, { color: "#2E7D32" }]}>
            You're almost there! Add ₹60 and unlock free delivery!
          </Text>
        </View>

        {/* CART ITEMS */}
        {items.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 80, fontSize: 18 }}>
            Your cart is empty
          </Text>
        ) : (
          items.map((item) => {
            const product = item.productId;
            const variant = item.variantId;

            const img =
              product?.images?.[0]
                ? `${ApiService.baseURL}/${product.images[0]}`
                : "https://via.placeholder.com/150";

            return (
              <View key={item._id} style={styles.itemCard}>
                <Image source={{ uri: img }} style={styles.itemImage} />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  <Text style={styles.itemWeight}>{variant?.name}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.price * item.quantity}
                  </Text>
                </View>

                {/* QTY CONTROL */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>

                  {/* ––––– MINUS BUTTON ––––– */}
                  <TouchableOpacity
                    onPress={() => updateQuantity(item, -1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 20, color: "#000" }}>−</Text>
                  </TouchableOpacity>

                  {/* QUANTITY */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      marginHorizontal: 10,
                      color: "#000",
                    }}
                  >
                    {item.quantity}
                  </Text>

                  {/* ––––– PLUS BUTTON ––––– */}
                  <TouchableOpacity
                    onPress={() => updateQuantity(item, +1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: "#4CAF50",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 20 }}>+</Text>
                  </TouchableOpacity>

                </View>


                {/* DELETE */}
                <TouchableOpacity onPress={() => removeItem(variant?._id || "", product._id)} style={{ marginLeft: 12, justifyContent: "center" }}>
                  <MaterialIcons name="delete-outline" size={26} color="#999" />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* COUPON SECTION */}
        <TouchableOpacity style={styles.couponButton}>
          <Text style={styles.couponText}>See Available Coupons</Text>
          <MaterialIcons name="arrow-forward-ios" size={16} color="#000" />
        </TouchableOpacity>

        {/* DELIVERY INSTRUCTIONS */}
        <View style={{ marginHorizontal: 16, marginTop: 18 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
            Delivery Instructions
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[
              { id: 1, icon: "call-outline", text: "Avoid calling" },
              { id: 2, icon: "home-outline", text: "Leave at door" },
              { id: 3, icon: "shield-checkmark-outline", text: "Leave with guard" },
              { id: 4, icon: "notifications-off-outline", text: "Don't ring bell" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setDeliveryOption(opt.id)}
                style={{
                  width: 70,
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor:
                    deliveryOption === opt.id ? "#C8E6C9" : "#F4F4F4",
                }}
              >
                <Icon
                  name={opt.icon}
                  size={22}
                  color={deliveryOption === opt.id ? "#2E7D32" : "#555"}
                />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: "600",
                    textAlign: "center",
                    color: "#444",
                  }}
                >
                  {opt.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PAYMENT DETAILS */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentLabel}>Payment Details</Text>

          <Row label="Items Total" value={`₹${totals.itemPriceTotal}`} />
          <Row label="Handling Charge" value={`₹${totals.handlingCharge}`} />
          <Row label="Delivery Charge" value={`₹${totals.deliveryCharge}`} />

          <View style={styles.grandTotalRow}>
            <Row bold label="Grand Total" value={`₹${totals.grandTotal + selectedTip}`} />
          </View>
        </View>

        {/* SAVINGS */}
        <View style={styles.savingsBox}>
          <Text style={styles.savingsText}>Your Total Saving</Text>
          <Text style={styles.savingsText}>
            ₹{totals.itemMrpTotal - totals.itemPriceTotal}
          </Text>
        </View>

        {/* TIP BOX */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Tip Your Delivery Partner</Text>

          <View style={styles.tipButtonsRow}>
            {[10, 20, 30, 50].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setSelectedTip(v)}
                style={[
                  styles.tipButton,
                  selectedTip === v && styles.selectedTip,
                ]}
              >
                <Text style={styles.tipText}>₹{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View
        style={{
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
          elevation: 5,
        }}
      >
        {/* TOTAL PRICE */}
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#000" }}>
          ₹{totals.grandTotal + selectedTip}
        </Text>

        {/* PLACE ORDER BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Checkout")}
          style={{
            backgroundColor: "#4CAF50",
            paddingVertical: 12,
            paddingHorizontal: 26,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const Row = ({ label, value, bold }) => (
  <View style={styles.paymentRow}>
    <Text
      style={{
        fontSize: 16,
        fontWeight: bold ? "700" : "500",
        color: "#000",
      }}
    >
      {label}
    </Text>

    <Text
      style={{
        fontSize: bold ? 18 : 16,
        fontWeight: bold ? "700" : "500",
        color: bold ? "#2E7D32" : "#000",
      }}
    >
      {value}
    </Text>
  </View>
);

export default Cart;
