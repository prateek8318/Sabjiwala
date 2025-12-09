import React, { FC, useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  Text,
  Alert,
} from 'react-native';
import styles from './profile.styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';
import { Colors, Icon } from '../../../../constant';
import {
  BorderButton,
  Header,
  LinearButton,
  TextView,
} from '../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import CustomBlurView from '../../../../components/BlurView/blurView';
import { UserDataContext } from '../../../../context/userDataContext';
import Toast from 'react-native-toast-message';
import { handleSignout } from '../../../../helpers/helpers';
import { LocalStorage } from '../../../../helpers/localstorage';
import { IMAGE_BASE_URL } from '../../../../service/apiService';
import OrderIcon from '../../../../assets/images/order.png';
import SupportIcon from '../../../../assets/images/support.png';

// Image Picker
import * as ImagePicker from 'react-native-image-picker';
import ApiService from '../../../../service/apiService';

type ProfileScreenNavigationType = NativeStackNavigationProp<any, 'Profile'>;

const menu = [
  { name: 'Refer & Earn' },
  { name: 'Wallet' },
  { name: 'Address' },
  { name: 'Privacy & Policy' },
  { name: 'About Us' },
  { name: 'Terms & Conditions' },
  { name: 'Log Out' },
  { name: 'Delete Account' },
];

const Profile: FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationType>();
  const [isBlur, setIsBlur] = useState(false);
  const [logOutModal, setLogOutModal] = useState(false);
  const [DeleteAccountModal, setDeleteAccountModal] = useState(false);

  const { userData, setUserData, setIsLoggedIn } = useContext(UserDataContext);

  const [displayName, setDisplayName] = useState('Guest User');
  const [displayPhone, setDisplayPhone] = useState('+91 XXXXXXXX');

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = await LocalStorage.get('@user');
        if (saved) {
          const user = JSON.parse(saved);
          setUserData(user);
          if (user.name) setDisplayName(user.name);
          if (user.mobileNo) setDisplayPhone(`+91 ${user.mobileNo}`);
        }
      } catch (e) {
        console.log('Load user error');
      }
    };
    loadUser();
  }, []);

  // Real-time update from context
  useEffect(() => {
    if (userData?.name) setDisplayName(userData.name);
    if (userData?.mobileNo) setDisplayPhone(`+91 ${userData.mobileNo}`);
  }, [userData]);

  const profileImage = userData?.profileImage
    ? `${IMAGE_BASE_URL}${userData.profileImage}`
    : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s';

  // Image Upload Function
  const handleImageUpload = () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Toast.show({ type: 'error', text1: 'Error picking image' });
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      const file = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'profile.jpg',
      };

      try {
        const formData = new FormData();
        formData.append('profileImage', file as any);

        const res = await ApiService.uploadProfileImage(formData, 'image');

        const uploadedImage =
          res.data?.user?.profileImage ||
          res.data?.image ||
          res.data?.imageUrl ||
          res.data?.url ||
          res.data?.path ||
          res.data?.data?.imageUrl;

        if (!uploadedImage) {
          Toast.show({ type: 'error', text1: 'Upload failed', text2: 'No image returned from server' });
          return;
        }

        const updatedUser = res.data?.user
          ? res.data.user
          : { ...userData, profileImage: uploadedImage };

        setUserData(updatedUser);
        await LocalStorage.save('@user', JSON.stringify(updatedUser));
        Toast.show({ type: 'success', text1: 'Profile picture updated!' });
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Upload failed',
          text2: err.response?.data?.message || 'Try again',
        });
      }
    });
  };

  const handleMenuAction = (menuName: string) => {
    switch (menuName) {
      case 'Refer & Earn': navigation.navigate('ReferEarn'); break;
      case 'Wallet': navigation.navigate('Wallet'); break;
      case 'Address': navigation.navigate('Address'); break;
      case 'Privacy & Policy': navigation.navigate('PrivacyPolicy'); break;
      case 'About Us': navigation.navigate('AboutUs'); break;
      case 'Terms & Conditions': navigation.navigate('TermsCondition'); break;
      case 'Log Out':
        setLogOutModal(true);
        setIsBlur(true);
        break;
      case 'Delete Account':
        setDeleteAccountModal(true);
        setIsBlur(true);
        break;
    }
  };

  const renderMenu = ({ item }: { item: { name: string } }) => (
    <TouchableOpacity style={styles.itemMenuView} onPress={() => handleMenuAction(item.name)}>
      <TextView style={styles.txtMenu}>{item.name}</TextView>
      <Icon family="AntDesign" name="right" color={Colors.PRIMARY[100]} size={24} />
    </TouchableOpacity>
  );

  const signout = async () => {
    await handleSignout(setIsLoggedIn);
    Toast.show({ type: 'success', text1: 'Logged out successfully!' });
    setLogOutModal(false);
    setIsBlur(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {isBlur && <CustomBlurView />}

        <Header title="Profile" />

        {/* Profile Header Card with Upload */}
        <View style={{ marginTop: hp(2), alignItems: 'center' }}>
          <LinearGradient
            colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
            style={styles.cardView}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
          >
            {/* Profile Image + Camera Icon */}
            <View style={styles.profilePicContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profilePic}
                resizeMode="cover"
              />

             
            </View>

            <View style={styles.profileView}>
              <TextView
                style={styles.txtEditProfile}
                onPress={() => navigation.navigate('EditProfile')}
              >
                Edit Profile
              </TextView>
              <TextView style={styles.txtUserDetail} numberOfLines={1}>
                {displayName}
              </TextView>
              <TextView style={styles.txtUserDetail}>{displayPhone}</TextView>
            </View>
          </LinearGradient>
        </View>

        {/* Your Order & Support */}
        <View style={styles.otherCardView}>
          <Pressable onPress={() => navigation.navigate('BottomStackNavigator', { screen: 'MyOrder' })}>
            <LinearGradient
              colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
              style={[styles.otherCads, { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }]}
            >
              <Image source={OrderIcon} style={{ width: 40, height: 40, marginBottom: 5 }} resizeMode="contain" />
              <TextView style={styles.txtUserDetail}>Your Order</TextView>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Support')}>
            <LinearGradient
              colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
              style={[styles.otherCads, { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }]}
            >
              <Image source={SupportIcon} style={{ width: 40, height: 40, marginBottom: 5 }} resizeMode="contain" />
              <TextView style={styles.txtUserDetail}>Support</TextView>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Menu List */}
        <FlatList
          data={menu}
          renderItem={renderMenu}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ alignSelf: 'center', marginBottom: hp(3) }}
        />
      </ScrollView>

      {/* Logout Modal */}
      <Modal transparent visible={logOutModal} animationType="slide">
        <Pressable style={styles.modalView} onPress={() => { setLogOutModal(false); setIsBlur(false); }}>
          <View style={styles.modalViewContainer}>
            <Text style={styles.txtSure}>Are you sure you want to {'\n'} logout?</Text>
            <View style={styles.buttonView}>
              <BorderButton title="Yes" buttonWidth={wp(38)} titleStyle={styles.buttonTitle} onPress={signout} />
              <LinearButton
                title="No"
                titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
                style={{ width: wp(38) }}
                onPress={() => { setLogOutModal(false); setIsBlur(false); }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Delete Account Modal */}
      <Modal transparent visible={DeleteAccountModal} animationType="slide">
        <Pressable style={styles.modalView} onPress={() => { setDeleteAccountModal(false); setIsBlur(false); }}>
          <View style={styles.modalViewContainer}>
            <Text style={styles.txtSure}>Are you sure you want to {'\n'} Delete Account?</Text>
            <View style={styles.buttonView}>
              <BorderButton title="Yes" buttonWidth={wp(38)} titleStyle={styles.buttonTitle} onPress={signout} />
              <LinearButton
                title="No"
                titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
                style={{ width: wp(38) }}
                onPress={() => { setDeleteAccountModal(false); setIsBlur(false); }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;