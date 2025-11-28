import React, { FC, useContext, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  Text,
} from 'react-native';
import styles from './profile.styles';
import { HomeStackProps } from '../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';
import { Colors, Fonts, Icon, Images, Typography } from '../../../../constant';
import {
  BorderButton,
  Header,
  LinearButton,
  TextView,
} from '../../../../components';
import InputText from '../../../../components/InputText/TextInput';
import LinearGradient from 'react-native-linear-gradient';
import CustomBlurView from '../../../../components/BlurView/blurView';
import { UserData, UserDataContext } from '../../../../context/userDataContext';
import Toast from 'react-native-toast-message';
import { handleSignout } from '../../../../helpers/helpers';

type ProfileScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Profile'
>;

const menu = [
  {
    name: 'Refer & Earn',
  },
  {
    name: 'Wallet',
  },
  {
    name: 'Address',
  },
  {
    name: 'Privacy & Policy',
  },
  {
    name: 'About Us',
  },
  {
    name: 'Terms & Conditions',
  },
  {
    name: 'Log Out',
  },
  {
    name: 'Delete Account',
  },
];

const Profile: FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationType>();
  const [isBlur, setIsBlur] = useState(false);
  const [logOutModal, setLogOutModal] = useState(false);
  const [DeleteAccountModal, setDeleteAccountModal] = useState(false);
  const { userData, setUserData, setIsLoggedIn } =
    useContext<UserData>(UserDataContext);

  // Add this function inside your Profile component
  const handleMenuAction = (menuName: string) => {
    switch (menuName) {
      case 'Refer & Earn':
        navigation.navigate('ReferEarn');
        break;
      case 'Wallet':
        navigation.navigate('Wallet');
        break;
      case 'Address':
        navigation.navigate('Address');
        break;
      case 'Privacy & Policy':
        navigation.navigate('PrivacyPolicy');
        break;
      case 'About Us':
        navigation.navigate('AboutUs');
        break;
      case 'Terms & Conditions':
        navigation.navigate('TermsCondition');
        break;
      case 'Log Out':
        setLogOutModal(true);
        setIsBlur(true);
        break;
      case 'Delete Account':
        setDeleteAccountModal(true);
        setIsBlur(true);
        break;

      default:
        console.warn('No action defined for', menuName);
    }
  };

  const renderMenu = (item: any) => {
    return (
      <TouchableOpacity
        style={styles.itemMenuView}
        onPress={() => handleMenuAction(item.item.name)}
      >
        <TextView style={styles.txtMenu}>{item.item.name}</TextView>
        <Icon
          family="AntDesign"
          name="right"
          color={Colors.PRIMARY[100]}
          size={24}
        />
      </TouchableOpacity>
    );
  };

  const signout = async () => {
    handleSignout(setIsLoggedIn);
    Toast.show({
      type: 'success',
      text1: 'Log Out Successfully!',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {isBlur && <CustomBlurView />}
        <View>
          <Header title="Profile" />
        </View>

        <View>
          <LinearGradient
            colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
            style={styles.cardView}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
          >
            <View style={styles.profilePicView}>
              <Image
                source={{
                  uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s',
                }}
                style={styles.profilePic}
              />
            </View>
            <View style={styles.profileView}>
              <TextView
                style={styles.txtEditProfile}
                onPress={() => navigation.navigate('EditProfile')}
              >
                Edit Profile
              </TextView>
              <TextView style={styles.txtUserDetail}>Shalini Sharma</TextView>
              <TextView style={styles.txtUserDetail}>+91 9876543210</TextView>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.otherCardView}>
          <LinearGradient
            colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
            style={styles.otherCads}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
          >
            <TextView style={styles.txtUserDetail}>Your Order</TextView>
          </LinearGradient>
          <Pressable onPress={() => navigation.navigate('Support')}>
            <LinearGradient
              colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
              style={styles.otherCads}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 0.5, y: 1 }}
            >
              <TextView style={styles.txtUserDetail}>Support</TextView>
            </LinearGradient>
          </Pressable>
        </View>

        <View>
          <FlatList
            data={menu}
            renderItem={renderMenu}
            contentContainerStyle={{ alignSelf: 'center', marginBottom: hp(5) }}
          />
        </View>
      </ScrollView>
      <Modal
        transparent={true}
        visible={logOutModal}
        animationType="slide"
        onRequestClose={() => {
          setLogOutModal(false), setIsBlur(false);
        }}
      >
        <Pressable
          style={styles.modalView}
          onPress={() => {
            setLogOutModal(false), setIsBlur(false);
          }}
        >
          <View style={styles.modalViewContainer}>
            <Text style={styles.txtSure}>
              Are you sure you want to {'\n'} logout?
            </Text>
            <View style={styles.buttonView}>
              <BorderButton
                title="Yes"
                buttonWidth={wp(38)}
                titleStyle={styles.buttonTitle}
                onPress={() => signout()}
              />
              <LinearButton
                title="No"
                //@ts-ignore
                titleStyle={[
                  styles.buttonTitle,
                  { color: Colors.PRIMARY[300] },
                ]}
                style={{ width: wp(38) }}
                onPress={() => {
                  setLogOutModal(false), setIsBlur(false);
                }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
      <Modal
        transparent={true}
        visible={DeleteAccountModal}
        animationType="slide"
        onRequestClose={() => {
          setDeleteAccountModal(false), setIsBlur(false);
        }}
      >
        <Pressable
          style={styles.modalView}
          onPress={() => {
            setDeleteAccountModal(false), setIsBlur(false);
          }}
        >
          <View style={styles.modalViewContainer}>
            <Text style={styles.txtSure}>
              Are you sure you want to {'\n'} Delete Account?
            </Text>
            <View style={styles.buttonView}>
              <BorderButton
                title="Yes"
                buttonWidth={wp(38)}
                titleStyle={styles.buttonTitle}
                onPress={() => signout()}
              />
              <LinearButton
                title="No"
                //@ts-ignore
                titleStyle={[
                  styles.buttonTitle,
                  { color: Colors.PRIMARY[300] },
                ]}
                style={{ width: wp(38) }}
                onPress={() => {
                  setDeleteAccountModal(false), setIsBlur(false);
                }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
