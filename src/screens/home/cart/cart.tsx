// screens/Cart.tsx
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useCart } from '../../../context/CartContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Cart = () => {
  const {
    items,
    totalPrice,
    totalSavings,
    loading,
    updateQuantity,
    removeItem
  } = useCart();

  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [selectedPayment] = useState('Gpay');

  const deliveryCharge = totalPrice >= 60 ? 0 : 30;
  const handlingCharge = 10;
  const grandTotal = totalPrice + handlingCharge + deliveryCharge + (selectedTip || 0);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <TouchableOpacity>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: '800', flex: 1, textAlign: 'center', marginRight: 40 }}>
            Cart
          </Text>
        </View>

        {/* Free Delivery Banner */}
        <View style={{
          backgroundColor: totalPrice >= 60 ? '#d4edda' : '#fff3cd',
          marginHorizontal: 16,
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: totalPrice >= 60 ? '#c3e6cb' : '#ffeaa7',
          marginTop: 8
        }}>
          <Text style={{
            color: totalPrice >= 60 ? '#155724' : '#856404',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 16
          }}>
            {totalPrice >= 60
              ? 'You have unlocked free delivery!'
              : `You’re almost there! Add ₹${(60 - totalPrice).toFixed(0)} more to unlock free delivery!`}
          </Text>
        </View>

        {/* Cart Items */}
        {items.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 100, fontSize: 20, color: '#999', fontWeight: '600' }}>
            Your cart is empty
          </Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={{
              flexDirection: 'row',
              marginHorizontal: 16,
              marginTop: 16,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 6,
            }}>
              <Image source={{ uri: item.image }} style={{ width: 90, height: 90, borderRadius: 16 }} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>{item.name}</Text>
                <Text style={{ color: '#666', fontSize: 15, marginTop: 4 }}>{item.weight}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 8 }}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 30, padding: 6 }}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <View style={{ width: 38, height: 38, backgroundColor: '#fff', borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' }}>
                    <Text style={{ fontSize: 22, color: '#666' }}>-</Text>
                  </View>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 20, fontWeight: 'bold', fontSize: 18, color: '#000' }}>
                  {item.quantity}
                </Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <View style={{ width: 38, height: 38, backgroundColor: '#4CAF50', borderRadius: 19, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 22 }}>+</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 16, justifyContent: 'center' }}>
                <MaterialIcons name="delete-outline" size={28} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Coupon */}
        <TouchableOpacity style={{
          backgroundColor: '#E8F5E8',
          marginHorizontal: 16,
          marginTop: 20,
          padding: 18,
          borderRadius: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#C8E6C9'
        }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#000' }}>See Available Coupon</Text>
          <Icon name="chevron-forward" size={30} color="#4CAF50" />
        </TouchableOpacity>

        {/* Payment Details – Clean & Visible */}
        <View style={{ backgroundColor: '#f8f9fa', marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 16 }}>Payment Details</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#555' }}>Items Total</Text>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#000' }}>₹{totalPrice.toFixed(0)}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#555' }}>Handling Charge</Text>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#000' }}>₹{handlingCharge}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, color: '#555' }}>Delivery Charge</Text>
            <Text style={{
              fontSize: 17,
              fontWeight: 'bold',
              color: deliveryCharge === 0 ? '#4CAF50' : '#000'
            }}>
              {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
            </Text>
          </View>

          {selectedTip ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#555' }}>Tip</Text>
              <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#4CAF50' }}>₹{selectedTip}</Text>
            </View>
          ) : null}

          <View style={{ borderTopWidth: 1.5, borderColor: '#ddd', paddingTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#000' }}>Grand Total</Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#4CAF50' }}>₹{grandTotal.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Total Savings – Only if exists */}
        {items.length > 0 && totalSavings > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>Your Total Saving</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#4CAF50' }}>₹{totalSavings.toFixed(0)}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Fixed Bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <LinearGradient colors={['#E8F5E8', '#C8E6C9']} style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 14, color: '#555' }}>PAY USING</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>{selectedPayment} UPI</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#000' }}>₹{grandTotal.toFixed(0)}</Text>
              <TouchableOpacity style={{
                backgroundColor: '#fff',
                paddingHorizontal: 40,
                paddingVertical: 16,
                borderRadius: 30,
                marginTop: 8,
                flexDirection: 'row',
                alignItems: 'center',
                elevation: 6
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>Place order</Text>
                <Icon name="chevron-forward" size={24} color="#000" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default Cart;