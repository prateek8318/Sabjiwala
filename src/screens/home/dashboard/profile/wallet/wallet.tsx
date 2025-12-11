import React, { FC, useState, useEffect } from 'react';
import {
  SafeAreaView,
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
} from 'react-native';
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

  // Fetch wallet history + balance
  const fetchWalletHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [historyRes, balanceRes] = await Promise.all([
        ApiService.getWalletHistory(),
        ApiService.getWalletBalance(),
      ]);

      // Handle history response (show most recent first)
      if (historyRes?.data?.success && historyRes.data.data) {
        let history: WalletHistoryItem[] = [];

        if (Array.isArray(historyRes.data.data)) {
          history = historyRes.data.data;
        } else if (historyRes.data.data.walletHistory) {
          history = historyRes.data.data.walletHistory;
        } else if (Array.isArray(historyRes.data.data.transactions)) {
          history = historyRes.data.data.transactions;
        }

        const sortedHistory = [...history].sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return bTime - aTime;
        });
        setWalletHistory(sortedHistory);
      } else {
        setWalletHistory([]);
      }

      // Handle balance response
      // Extract balance from multiple possible response shapes
      let currentBalance = balance;
      const balancePayload = balanceRes?.data ?? {};
      const balanceData = balancePayload.data ?? balancePayload;

      const extractedBalance =
        (typeof balanceData === 'number' ? balanceData : undefined) ??
        balanceData?.balance ??
        balanceData?.currentBalance ??
        balanceData?.walletBalance ??
        balanceData?.wallet?.balance ??
        balanceData?.wallet?.currentBalance;

      if (extractedBalance !== undefined) {
        currentBalance = Number(extractedBalance) || 0;
      } else if (
        historyRes?.data?.success &&
        Array.isArray(historyRes.data.data) &&
        historyRes.data.data.length > 0
      ) {
        // History may arrive unsorted; use latest by createdAt
        const sorted = [...historyRes.data.data].sort((a: any, b: any) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return bTime - aTime;
        });
        currentBalance = sorted[0].balance_after_action || 0;
      }

      setBalance(currentBalance);
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
      <SafeAreaView style={styles.container}>
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
                <TextView style={styles.emptyText}>No transactions yet</TextView>
              </View>
            ) : (
              /* Ye naya FlatList laga do – perfect scroll karega */
              <FlatList
                data={walletHistory}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                bounces={true}
                contentContainerStyle={{ paddingBottom: hp(12) }}  /* bottom button ke liye space */
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View style={styles.historyItemLeft}>
                      <TextView style={styles.historyAction}>
                        {item.action === 'credit' ? 'Credit' : 'Debit'}
                      </TextView>
                      <TextView style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TextView>
                      {item.description ? (
                        <TextView style={styles.historyDescription}>{item.description}</TextView>
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
                        Balance: ₹ {item.balance_after_action.toFixed(2)}
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
              <View style={styles.payModeView}>
                <Image source={Images.ic_gpay} style={styles.imgPayMode} />
                <View>
                  <TextView style={styles.txtPayMode}>Pay Using</TextView>
                  <TextView style={styles.txtPayVia}>Razorpay (UPI / Card)</TextView>
                </View>
                <Icon
                  family="FontAwesome6"
                  name="angle-down"
                  color={Colors.PRIMARY[400]}
                  size={24}
                />
              </View>

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
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Wallet;
