import React, { FC, useState } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import styles from './wallet.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import { Colors, Icon, Images } from '../../../../../constant';
import { Header, LinearButton, TextView } from '../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import InputText from '../../../../../components/InputText/TextInput';

type WalletScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Wallet'
>;

const Wallet: FC = () => {
  const navigation = useNavigation<WalletScreenNavigationType>();
  const [addMoney, setAddMoney] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Header title="Wallet" />
            </View>

            <View>
              <LinearGradient
                colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
                style={styles.cardView}
                start={{ x: 0.5, y: 0.2 }}
                end={{ x: 0.5, y: 1 }}
              >
                <TextView style={styles.txtTotalBalance}>
                  Total Balance
                </TextView>
                <Text style={styles.txtBalance}>₹ 580</Text>
              </LinearGradient>
            </View>

            <View style={styles.actionButtonView}>
              <LinearButton
                title="+ Add Money"
//                 @ts-ignore
                titleStyle={[
                  styles.buttonTitle,
//                   { color: Colors.PRIMARY[300] },
                ]}
                style={styles.btnView}
                onPress={() => setAddMoney(true)}
              />
            </View>

            <View style={styles.priceMainView}>
              <View style={styles.priceView}>
                <TextView style={styles.priceTxt}>+₹ 500</TextView>
              </View>
              <View style={styles.priceView}>
                <TextView style={styles.priceTxt}>+₹ 1000</TextView>
              </View>
              <View style={styles.priceView}>
                <TextView style={styles.priceTxt}>+₹ 2000</TextView>
              </View>
            </View>

            {addMoney && (
              <View>
                <InputText
                  value={''}
                  //@ts-ignore
                  inputStyle={[styles.inputView]}
                  inputContainer={[styles.inputContainer]}
                  placeHolderTextStyle={Colors.PRIMARY[400]}
                  placeholder="Enter Amount"
                  onChangeText={(value: string) => {
                    console.log('TEst', value);
                  }}
                />
              </View>
            )}
          </ScrollView>
          <View style={styles.bottomView}>
            <View style={styles.payModeView}>
              <Image source={Images.ic_gpay} style={styles.imgPayMode} />
              <View>
                <TextView style={styles.txtPayMode}>Pay Using </TextView>
                <TextView style={styles.txtPayVia}>Gpay UPI </TextView>
              </View>
              <Icon
                family="FontAwesome6"
                name="angle-down"
                color={Colors.PRIMARY[400]}
                size={24}
              />
            </View>

            <LinearGradient
              colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
              style={styles.btnPayView}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 0.5, y: 1 }}
            >
              <TextView style={styles.txtAmount}>₹ 1000</TextView>
              <View style={styles.txtPayView}>
                <Text style={styles.txtPay}>Pay Now</Text>
                <Icon
                  family="Entypo"
                  name="chevron-right"
                  size={24}
                  color={Colors.PRIMARY[300]}
                />
              </View>
            </LinearGradient>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Wallet;
