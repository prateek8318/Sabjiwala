import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Image,
  ScrollView,
  RefreshControl,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './wallet.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import { Colors, Icon, Images, RazorpayConfig } from '../../../../../constant';
import { Header, LinearButton, TextView } from '../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import InputText from '../../../../../components/InputText/TextInput';
import ApiService from '../../../../../service/apiService';
import RazorpayCheckout from 'react-native-razorpay';

type WalletScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Wallet'
>;

interface WalletHistoryItem {
  _id: string;
  userId: string;
  razorpay_id: string;
  action: 'credit' | 'debit';
  amount: number;
  balance_after_action: number;
  description: string;
  createdAt: string;
}

const Wallet: FC = () => {
  const navigation = useNavigation<WalletScreenNavigationType>();
  const isFocused = useIsFocused();
  const [addMoney, setAddMoney] = useState(false);
  const [amount, setAmount] = useState<string>('1000');
  const [walletHistory, setWalletHistory] = useState<WalletHistoryItem[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Razorpay UPI');

  // Fetch wallet history + balance
  const fetchWalletHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get both balance and history in parallel
      const [balanceRes, historyRes] = await Promise.all([
        ApiService.getWalletBalance(),
        ApiService.getWalletHistory()
      ]);

      // Handle history response (show most recent first)
      let history: WalletHistoryItem[] = [];
      
      // Try different response formats
      const responseData = historyRes?.data?.data || historyRes?.data || [];
      
      if (Array.isArray(responseData)) {
        history = responseData;
      } else if (responseData.walletHistory) {
        history = responseData.walletHistory;
      } else if (Array.isArray(responseData.transactions)) {
        history = responseData.transactions;
      } else if (responseData.list) {
        history = responseData.list;
      }

      // Filter out any transactions that don't have the required fields
      const validHistory = history.filter(tx => 
        tx && 
        tx._id && 
        tx.amount !== undefined && 
        (tx.balance_after_action !== undefined || tx.currentBalance !== undefined) &&
        tx.createdAt
      );

      // Sort by date (newest first)
      const sortedHistory = [...validHistory].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setWalletHistory(sortedHistory);
      
      // If we have transactions but no balance from API, use the latest transaction
      if (sortedHistory.length > 0 && !balanceRes?.data) {
        const latestTx = sortedHistory[0];
        setBalance(Number(latestTx.balance_after_action || latestTx.currentBalance) || 0);
        return;
      }

      // Handle balance response
      const balancePayload = balanceRes?.data ?? {};
      const balanceData = balancePayload.data ?? balancePayload;

      // Extract balance from multiple possible response shapes
      const extractedBalance =
        (typeof balanceData === 'number' ? balanceData : undefined) ??
        balanceData?.balance ??
        balanceData?.currentBalance ??
        balanceData?.walletBalance ??
        balanceData?.wallet?.balance ??
        balanceData?.wallet?.currentBalance;

      if (extractedBalance !== undefined) {
        setBalance(Number(extractedBalance) || 0);
      } else if (walletHistory.length > 0) {
        // If no balance from API but we have history, use the latest balance
        const latestTx = walletHistory[0];
        setBalance(latestTx.balance_after_action || 0);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.log('Wallet history fetch error:', error);
      setBalance(0);
      setWalletHistory([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchWalletHistory();
    }
  }, [isFocused]);

  // Handle Pay Now
  const handlePayNow = async () => {
    const amtNumber = parseFloat(amount);
    if (!amount || Number.isNaN(amtNumber) || amtNumber <= 0) {
      return;
    }

    try {
      setProcessingPayment(true);
      const orderRes = await ApiService.createRazorpayOrder(amtNumber);
      const orderData = orderRes?.data || {};
      const orderId =
        orderData.orderId ||
        orderData.id ||
        orderData?.data?.orderId ||
        orderData?.data?.id;
      const amountPaise =
        orderData.amount ||
        orderData?.data?.amount ||
        Math.round(Number(amtNumber) * 100);
      const currency =
        orderData.currency ||
        orderData?.data?.currency ||
        RazorpayConfig.currency ||
        'INR';

      const payment = await RazorpayCheckout.open({
        key: RazorpayConfig.keyId,
        name: RazorpayConfig.displayName || 'SabjiWala',
        description: 'Wallet Top-up',
        order_id: orderId,
        amount: amountPaise,
        currency,
        theme: { color: '#4CAF50' },
        notes: { wallet_topup_rupees: amtNumber.toString() },
      });

      const response = await ApiService.createWalletHistory({
        amount: amtNumber.toString(),
        action: 'credit',
        razorpay_id: payment?.razorpay_payment_id || '',
        description: 'Wallet top-up via Razorpay',
      });

      if (response?.data?.success) {
        const newHistory: WalletHistoryItem | undefined =
          response.data?.data?.newWalletHistory;

        if (newHistory) {
          setBalance(newHistory.balance_after_action ?? balance + amtNumber);
          setWalletHistory((prev) => [newHistory, ...prev]);
        } else {
          await fetchWalletHistory();
        }

        setAddMoney(false);
        setAmount('1000');
      }
    } catch (error: any) {
      console.log('Payment error:', error);
      const message =
        error?.description ||
        error?.error?.description ||
        error?.message ||
        'Payment was cancelled or failed. Please try again.';
      Alert.alert('Payment', message);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View>
          <Header title="Wallet" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={true}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: 16 }]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchWalletHistory(true)}
              colors={[Colors.PRIMARY[100]]}
              tintColor={Colors.PRIMARY[100]}
            />
          }
        >
          <View style={{ flexGrow: 1 }}>
            <LinearGradient
              colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
              style={styles.cardView}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 0.5, y: 1 }}
            >
              <TextView style={styles.txtTotalBalance}>
                Total Balance
              </TextView>
              {loading ? (
                <ActivityIndicator color={Colors.PRIMARY[300]} size="small" />
              ) : (
                <Text style={styles.txtBalance}>₹ {balance.toFixed(2)}</Text>
              )}
            </LinearGradient>
          </View>

          {addMoney && (
            <>
              <View style={styles.priceMainView}>
                <TouchableOpacity
                  style={[styles.priceView, amount === '500' && styles.priceViewSelected]}
                  onPress={() => setAmount('500')}
                >
                  <TextView style={[
                    styles.priceTxt,
                    amount === '500' && styles.priceTxtSelected
                  ]}>
                    +₹ 500
                  </TextView>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.priceView, amount === '1000' && styles.priceViewSelected]}
                  onPress={() => setAmount('1000')}
                >
                  <TextView style={[
                    styles.priceTxt,
                    amount === '1000' && styles.priceTxtSelected
                  ]}>
                    +₹ 1000
                  </TextView>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.priceView, amount === '2000' && styles.priceViewSelected]}
                  onPress={() => setAmount('2000')}
                >
                  <TextView style={[
                    styles.priceTxt,
                    amount === '2000' && styles.priceTxtSelected]}>
                    +₹ 2000
                  </TextView>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <InputText
                  value={amount}
                  //@ts-ignore
                  inputStyle={[styles.inputView]}
                  inputContainer={[styles.inputContainer]}
                  placeHolderTextStyle={Colors.PRIMARY[400]}
                  placeholder="Enter Amount"
                  keyboardType="numeric"
                  onChangeText={(value: string) => {
                    // Only allow numbers
                    const numericValue = value.replace(/[^0-9]/g, '');
                    setAmount(numericValue);
                  }}
                />
              </View>
            </>
          )}

          {/* Wallet History List */}
          <View style={styles.historyWrapper}>
            <TextView style={styles.historyTitle}>Transaction History</TextView>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.PRIMARY[100]} size="small" />
              </View>
            ) : walletHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon 
                  name="receipt" 
                  size={40} 
                  color={Colors.PRIMARY[200]} 
                  style={{ marginBottom: 10 }}
                  family="MaterialCommunityIcons"
                />
                <TextView style={styles.emptyText}>No transactions yet</TextView>
                <TextView style={[styles.emptyText, { fontSize: wp(3.5), marginTop: 5 }]}>
                  Your transaction history will appear here
                </TextView>
              </View>
            ) : (
              <FlatList
                data={walletHistory}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                bounces={true}
                contentContainerStyle={{ paddingBottom: hp(16) }}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View style={styles.historyItemLeft}>
                      <View style={styles.historyHeader}>
                        <View style={[
                          styles.historyIcon,
                          item.action === 'credit' ? styles.creditIcon : styles.debitIcon
                        ]}>
                          <Icon
                            name={item.action === 'credit' ? 'arrow-down' : 'arrow-up'}
                            size={16}
                            color={Colors.PRIMARY[300]}
                            family="Feather"
                          />
                        </View>
                        <TextView style={styles.historyAction}>
                          {item.action === 'credit' ? 'Money Added' : 'Money Spent'}
                        </TextView>
                      </View>
                      <TextView style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' • '}
                        {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </TextView>
                      {item.description ? (
                        <TextView style={styles.historyDescription} numberOfLines={1}>
                          {item.description}
                        </TextView>
                      ) : null}
                    </View>
                    <View style={styles.historyItemRight}>
                      <TextView
                        style={[
                          styles.historyAmount,
                          item.action === 'credit' ? styles.creditAmount : styles.debitAmount,
                        ]}>
                        {item.action === 'credit' ? '+' : '-'}₹ {item.amount.toFixed(2)}
                      </TextView>
                      <TextView style={styles.historyBalance}>
                        ₹{item.balance_after_action.toFixed(2)}
                      </TextView>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>

        {/* Bottom View - Always Visible */}
        <View style={styles.bottomView}>
          {addMoney ? (
            <>
              <TouchableOpacity 
                style={styles.payModeView}
                onPress={() => setShowPaymentMethods(true)}
                activeOpacity={0.8}
              >
                <View>
                  <TextView style={styles.txtPayMode}>Pay Using</TextView>
                  <TextView style={styles.txtPayVia}>{selectedPaymentMethod}</TextView>
                </View>
                <Icon
                  family="FontAwesome6"
                  name="angle-down"
                  color={Colors.PRIMARY[400]}
                  size={24}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePayNow}
                disabled={processingPayment || !amount || parseFloat(amount) <= 0}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
                  style={[
                    styles.btnPayView,
                    (processingPayment || !amount || parseFloat(amount) <= 0) && styles.btnPayViewDisabled,
                  ]}
                  start={{ x: 0.5, y: 0.2 }}
                  end={{ x: 0.5, y: 1 }}>
                  <TextView style={styles.txtAmount}>₹ {amount}</TextView>
                  <View style={styles.txtPayView}>
                    {processingPayment ? (
                      <ActivityIndicator color={Colors.PRIMARY[300]} size="small" />
                    ) : (
                      <>
                        <Text style={styles.txtPay}>Pay Now</Text>
                        <Icon
                          family="Entypo"
                          name="chevron-right"
                          size={24}
                          color={Colors.PRIMARY[300]}
                        />
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.addMoneyButtonContainer}>
              <LinearButton
                title="+ Add Money"
                //@ts-ignore
                titleStyle={styles.buttonTitle}
                style={styles.btnAddMoney}
                onPress={() => setAddMoney(true)}
              />
            </View>
          )}
        </View>

        {/* Payment Methods Modal */}
        <Modal
          visible={showPaymentMethods}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPaymentMethods(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Payment Method</Text>
                <TouchableOpacity onPress={() => setShowPaymentMethods(false)}>
                  <Icon name="close" size={24} color={Colors.PRIMARY[400]} family="MaterialCommunityIcons" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.paymentMethodsList}>
                {/* UPI Payment Methods */}
                <View style={styles.paymentSection}>
                  <Text style={styles.sectionTitle}>UPI Apps</Text>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethod, styles.disabledPayment]}
                    disabled={true}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Icon 
                        name="phone" 
                        size={24} 
                        color={Colors.PRIMARY[100]} 
                        style={styles.paymentIcon}
                        family="MaterialCommunityIcons"
                      />
                      <Text style={[styles.paymentMethodText, styles.disabledText]}>PhonePe</Text>
                    </View>
                    <Text style={[styles.comingSoonText, styles.disabledText]}>Coming Soon</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethod, styles.disabledPayment]}
                    disabled={true}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Icon 
                        name="wallet" 
                        size={24} 
                        color={Colors.PRIMARY[100]} 
                        style={styles.paymentIcon}
                        family="MaterialCommunityIcons"
                      />
                      <Text style={[styles.paymentMethodText, styles.disabledText]}>Paytm</Text>
                    </View>
                    <Text style={[styles.comingSoonText, styles.disabledText]}>Coming Soon</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethod, styles.disabledPayment]}
                    disabled={true}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Icon 
                        name="amazon" 
                        size={24} 
                        color={Colors.PRIMARY[100]} 
                        style={styles.paymentIcon}
                        family="MaterialCommunityIcons"
                      />
                      <Text style={[styles.paymentMethodText, styles.disabledText]}>Amazon Pay</Text>
                    </View>
                    <Text style={[styles.comingSoonText, styles.disabledText]}>Coming Soon</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Other Payment Methods */}
                <View style={styles.paymentSection}>
                  <Text style={styles.sectionTitle}>Other Payment Methods</Text>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethod, styles.selectedPayment]}
                    onPress={() => {
                      setSelectedPaymentMethod('Razorpay UPI');
                      setShowPaymentMethods(false);
                    }}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Icon 
                        name="bank-transfer" 
                        size={24} 
                        color={Colors.PRIMARY[100]} 
                        style={styles.paymentIcon}
                        family="MaterialCommunityIcons"
                      />
                      <Text style={styles.paymentMethodText}>Razorpay UPI</Text>
                    </View>
                    <Icon 
                    name="check-circle" 
                    size={24} 
                    color={Colors.PRIMARY[100]} 
                    family="MaterialCommunityIcons"
                  />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethod, styles.disabledPayment]}
                    disabled={true}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Icon 
                        name="credit-card" 
                        size={24} 
                        color={Colors.PRIMARY[100]} 
                        style={styles.paymentIcon} 
                        family="MaterialCommunityIcons"
                      />
                      <Text style={[styles.paymentMethodText, styles.disabledText]}>Credit/Debit Card</Text>
                    </View>
                    <Text style={[styles.comingSoonText, styles.disabledText]}>Coming Soon</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethod, styles.disabledPayment]}
                    disabled={true}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Icon 
                        name="bank" 
                        size={24} 
                        color={Colors.PRIMARY[100]} 
                        style={styles.paymentIcon} 
                        family="MaterialCommunityIcons"
                      />
                      <Text style={[styles.paymentMethodText, styles.disabledText]}>Net Banking</Text>
                    </View>
                    <Text style={[styles.comingSoonText, styles.disabledText]}>Coming Soon</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Wallet;
