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
import { useIsFocused } from '@react-navigation/native'; // <- Import this

const Cart = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({
    itemPriceTotal: 0,
    itemMrpTotal: 0,
    handlingCharge: 0,
    deliveryCharge: 0,
    grandTotal: 0,
  });

  const [selectedTip, setSelectedTip] = useState(0);

  const isFocused = useIsFocused(); // <- Detect if screen is focused

  // ----------------- FETCH CART -----------------
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", flex: 1, textAlign: "center", marginRight: 40 }}>
            Cart
          </Text>
        </View>

        {/* Cart Items */}
        {items.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 100, fontSize: 18, color: "#999" }}>
            Your cart is empty
          </Text>
        ) : (
          items.map((item) => {
            const product = item?.productId;
            const variant = item?.variantId;
            if (!product) return null;

            return (
              <View
                key={item._id}
                style={{
                  flexDirection: "row",
                  marginHorizontal: 16,
                  marginTop: 12,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 12,
                  elevation: 3,
                }}
              >
                <Image
                  source={{ uri: ApiService.baseURL + (product?.images?.[0] || "") }}
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 17, fontWeight: "bold" }}>{product?.name || ""}</Text>
                  <Text style={{ color: "#666", fontSize: 14 }}>{variant?.name || ""}</Text>
                  <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 8 }}>
                    ₹{(item?.price || 0) * (item?.quantity || 0)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 30, padding: 1 }}>
                  <TouchableOpacity onPress={() => updateQuantity(item, -1)}>
                    <Text style={{ fontSize: 24, paddingHorizontal: 10 }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 16, fontWeight: "bold", fontSize: 16 }}>{item?.quantity || 0}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item, +1)}>
                    <View style={{ backgroundColor: "#4CAF50", borderRadius: 17, width: 34, height: 34, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: "#fff", fontSize: 20 }}>+</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => removeItem(variant?._id || "", product._id)} style={{ marginLeft: 12, justifyContent: "center" }}>
                  <MaterialIcons name="delete-outline" size={26} color="#999" />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Payment Details */}
        <View style={{ backgroundColor: "#f9f9f9", margin: 16, padding: 16, borderRadius: 12 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 12 }}>Payment Details</Text>

          <Row label="Items Total" value={`₹${totals.itemPriceTotal}`} />
          <Row label="MRP Total" value={`₹${totals.itemMrpTotal}`} />
          <Row label="Handling Charge" value={`₹${totals.handlingCharge}`} />
          <Row label="Delivery Charge" value={`₹${totals.deliveryCharge}`} />

          <View style={{ borderTopWidth: 1, borderColor: "#ddd", paddingTop: 12, marginTop: 10 }}>
            <Row bold label="Grand Total" value={`₹${totals.grandTotal + (selectedTip || 0)}`} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value, bold }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
    <Text style={{ fontWeight: bold ? "bold" : "normal", fontSize: bold ? 16 : 14 }}>{label}</Text>
    <Text style={{ fontWeight: bold ? "bold" : "normal", fontSize: bold ? 18 : 14, color: bold ? "#4CAF50" : "#000" }}>{value}</Text>
  </View>
);

export default Cart;
