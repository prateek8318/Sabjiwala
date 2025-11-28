import React, { FC, useContext, useState } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './addAddress.styles';
import { AuthStackProps } from '../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  TextView,
  LinearButton,
  Header,
} from '../../../../components';
import { Colors } from '../../../../constant';
import InputText from '../../../../components/InputText/TextInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocalStorage } from '../../../../helpers/localstorage';
import { UserData, UserDataContext } from '../../../../context/userDataContext';

type AddAddressScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'AddAddress'
>;

const addressType = [
  {
    id: 0,
    name: 'Home',
  },
  {
    id: 1,
    name: 'Work',
  },
  {
    id: 2,
    name: 'Other',
  },
];

const AddAddress: FC = () => {
  const navigation = useNavigation<AddAddressScreenNavigationType>();
  const [selectedType, setSelectedType] = useState<number | null>(0);
  const insets = useSafeAreaInsets();
  const { setIsLoggedIn, setUserData } = useContext<UserData>(UserDataContext);

  const attempLogin = async () => {
    await LocalStorage.save('@user', "Data");
    setUserData("Data");
    await LocalStorage.save('@login', true);
    setIsLoggedIn(true);
  }

return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        extraScrollHeight={150}          // YE ADD KIYA
        showsVerticalScrollIndicator={false}
      >
        {/* YE ScrollView PURA HATA DIYA */}
        <View>
          <Header />
        </View>

        <View style={styles.addressView}>
          <TextView style={styles.txtAddress}>Save address as</TextView>
          <View style={styles.addressTypeContainer}>
            {addressType.map(item => {
              const isSelected = selectedType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.addressTypeButton,
                    {
                      borderColor: isSelected
                        ? Colors.PRIMARY[100]
                        : Colors.FLOATINGINPUT[300],
                    },
                  ]}
                  onPress={() => setSelectedType(item.id)}
                >
                  <TextView
                    style={[
                      styles.addressTypeText,
                      {
                        color: isSelected
                          ? Colors.PRIMARY[100]
                          : Colors.FLOATINGINPUT[300],
                      },
                    ]}
                  >
                    {item.name}
                  </TextView>
                </TouchableOpacity>
              );
            })}
          </View>

          <View>
          <InputText
  placeholder="Floor *"
  inputStyle={styles.inputView}
  inputContainer={[styles.inputContainer]}
  placeHolderTextStyle={Colors.PRIMARY[400]}
  onChangeText={(value) => console.log(value)}
/>

<InputText
  placeholder="House/Flat Number & Building Name *"
  inputStyle={styles.inputView}
  inputContainer={[styles.inputContainer]}
  placeHolderTextStyle={Colors.PRIMARY[400]}
  onChangeText={(v) => console.log(v)}
/>

<InputText
  placeholder="Landmark *"
  inputStyle={styles.inputView}
  inputContainer={[styles.inputContainer]}
  placeHolderTextStyle={Colors.PRIMARY[400]}
  onChangeText={(v) => console.log(v)}
/>

<InputText
  placeholder="Receiver Name"
  inputStyle={styles.inputView}
  inputContainer={[styles.inputContainer]}
  placeHolderTextStyle={Colors.PRIMARY[400]}
  onChangeText={(v) => console.log(v)}
/>

<InputText
  placeholder="Receiver Number"
  inputStyle={styles.inputView}
  inputContainer={[styles.inputContainer]}
  placeHolderTextStyle={Colors.PRIMARY[400]}
  onChangeText={(v) => console.log(v)}
/>

          </View>
        </View>

        <View style={styles.buttonView}>
        <LinearButton
  style={{ width: '100%' }}      
  title="Save Address"
  titleStyle={{ 
    ...styles.buttonTitle,
    color: Colors.PRIMARY[300]
  }}
  
  onPress={() => attempLogin()}
/>

        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  </TouchableWithoutFeedback>
);
};

export default AddAddress;
