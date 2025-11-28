import React, { FC, useContext, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
  Pressable,
} from 'react-native';
import styles from './searchLocation.styles';
import { AuthStackProps } from '../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CommonLoader,
  CommonAlertModal,
  TextView,
  Button,
  LinearButton,
  BorderButton,
  Header,
} from '../../../../components';
import { useFormik } from 'formik';
import { UserData, UserDataContext } from '../../../../context/userDataContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';
import { Colors, Fonts, Icon, Images, Typography } from '../../../../constant';
import InputText from '../../../../components/InputText/TextInput';
import Toast from 'react-native-toast-message';

type SearchLocationScreenNavigationType = NativeStackNavigationProp<
  AuthStackProps,
  'SearchLocation'
>;

const SearchLocation: FC = () => {
  const navigation = useNavigation<SearchLocationScreenNavigationType>();
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View>
          <Header />
        </View>

        <View>
          <InputText
            value={searchQuery}
            //@ts-ignore
            inputStyle={[styles.inputView]}
            inputContainer={[styles.inputContainer]}
            showIcon={true}
            iconFamily={'EvilIcons'}
            icon="search"
            placeHolderTextStyle={Colors.PRIMARY[100]}
            placeholder="Search Your Location"
            onChangeText={(value: string) => {
              setSearchQuery(value);
            }}
          />
        </View>

        <View
          style={[
            styles.inputContainer,
            { borderColor: Colors.PRIMARY[100], borderWidth: 0.5 },
          ]}
        >
          <View style={styles.iconView}>
            <Icon
              family={'MaterialIcons'}
              name={'gps-fixed'}
              size={30}
              color={Colors.PRIMARY[100]}
            />
          </View>
          <TextView style={styles.txtLocation}>
            Use My Current Location
          </TextView>
        </View>
        
        <Pressable
          style={[
            styles.inputContainer,
            {
              borderColor: Colors.PRIMARY[100],
              borderWidth: 0.5,
              marginTop: 5,
            },
          ]}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <View style={styles.iconView}>
            <Icon
              family={'Entypo'}
              name={'plus'}
              size={30}
              color={Colors.PRIMARY[100]}
            />
          </View>
          <TextView style={styles.txtLocation}>Add New Address</TextView>
        </Pressable>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SearchLocation;
