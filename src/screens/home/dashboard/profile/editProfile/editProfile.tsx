import React, { FC, useContext, useState } from 'react';
import {
  SafeAreaView,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
} from 'react-native';
import styles from './editProfile.styles';
import { HomeStackProps } from '../../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import { Colors } from '../../../../../constant';
import { Header, TextView } from '../../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import InputText from '../../../../../components/InputText/TextInput';
import { UserDataContext, UserData } from '../../../../../context/userDataContext';
import Toast from 'react-native-toast-message';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { ApiService, IMAGE_BASE_URL } from '../../../../../service/apiService';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';

type EditProfileNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'EditProfile'
>;

const EditProfile: FC = () => {
  const navigation = useNavigation<EditProfileNavigationType>();
  const { userData, setUserData } = useContext<UserData>(UserDataContext);

  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [profileImage, setProfileImage] = useState(userData?.profileImage || '');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState<{ uri: string; name?: string; type?: string } | null>(null);

  const displayImage = profileImage
    ? (profileImage.startsWith('http') || profileImage.startsWith('file:'))
      ? profileImage
      : `${IMAGE_BASE_URL}${profileImage}`
    : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s';

  const showImagePicker = () => {
    SheetManager.show('image-picker-sheet');
  };

  const handleSelectedAsset = (asset: any) => {
    const uri = asset?.uri;
    const type = asset?.type;
    const name = asset?.fileName || 'profile.jpg';

    if (!uri) {
      Toast.show({ type: 'error', text1: 'Image selection failed' });
      return;
    }

    if (type && !type.startsWith('image/')) {
      Toast.show({ type: 'error', text1: 'Please select an image (no videos)' });
      return;
    }

    setSelectedImageUri(uri);
    setSelectedUploadFile({ uri, name, type: type || 'image/jpeg' });
    setProfileImage(uri);
  };

  const pickFromGallery = () => {
    SheetManager.hide('image-picker-sheet');
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1 },
      (response) => {
        if (response.didCancel || response.errorMessage) return;
        const asset = response.assets?.[0];
        if (asset) {
          handleSelectedAsset(asset);
        }
      }
    );
  };

  const pickFromCamera = () => {
    SheetManager.hide('image-picker-sheet');
    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
      (response) => {
        if (response.didCancel || response.errorMessage) return;
        const asset = response.assets?.[0];
        if (asset) {
          handleSelectedAsset(asset);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your name' });
      return;
    }
  
    try {
      let finalImageUrl = profileImage;
  
      // Agar nayi image select ki hai
      if (selectedUploadFile) {
        console.log('Uploading image...', selectedUploadFile);

        const uploadResponse = await ApiService.uploadProfileImage(
          {
            uri: selectedUploadFile.uri,
            name: selectedUploadFile.name || 'profile.jpg',
            type: selectedUploadFile.type || 'image/jpeg',
          },
          'image'
        );

        console.log('Upload Response:', uploadResponse.data);

        const uploadedImage =
          uploadResponse.data?.user?.profileImage ||
          uploadResponse.data?.imageUrl ||
          uploadResponse.data?.url ||
          uploadResponse.data?.image ||
          uploadResponse.data?.path ||
          uploadResponse.data?.data?.imageUrl;

        if (!uploadedImage || `${uploadedImage}`.includes('null')) {
          Toast.show({ type: 'error', text1: 'Image upload failed – No URL received' });
          return;
        }

        finalImageUrl = uploadedImage;
      }
  
      // Profile update
      await ApiService.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        profileImage: finalImageUrl !== userData?.profileImage ? finalImageUrl : undefined,
      });
  
      // Context update
      setUserData({
        ...userData,
        name: name.trim(),
        email: email.trim(),
        profileImage: finalImageUrl,
      });
  
      Toast.show({ type: 'success', text1: 'Profile updated successfully!' });
      navigation.goBack();
  
    } catch (error: any) {
      console.error('Full Error:', error);
      console.error('Response:', error.response?.data);
      
      Toast.show({
        type: 'error',
        text1: 'Upload Failed!',
        text2: error.response?.data?.message || 'Please try again',
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Header title="Edit Profile" showBack />

          <LinearGradient
            colors={[Colors.PRIMARY[100], Colors.PRIMARY[200]]}
            style={styles.cardView}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
          >
            <TextView style={styles.txtEditProfile}>Edit Profile</TextView>

            <TouchableOpacity onPress={showImagePicker} style={styles.imageContainer}>
              <Image
                source={{
                  uri: displayImage,
                }}
                style={styles.profileImage}
              />
              <View style={styles.editIconView}>
                <TextView style={{ color: '#fff', fontSize: 10 }}>Edit</TextView>
              </View>
            </TouchableOpacity>
          </LinearGradient>

          <View style={{ paddingHorizontal: wp(9), marginTop: hp(3) }}>
            <TextView style={{ color: '#000', fontSize: 14 }}>Name:</TextView>
            <InputText
              value={name}
              onChangeText={setName}
              inputContainer={styles.inputContainer}
              inputStyle={styles.inputView}
            />

            <TextView style={{ color: '#000', fontSize: 14,  }}>
              Mobile Number:
            </TextView>
            <InputText
              value={userData?.mobileNo ? `+91 ${userData.mobileNo}` : ''}
              editable={false}
              inputContainer={[styles.inputContainer, { backgroundColor: '#f5f5f5' }]}
              inputStyle={[styles.inputView, { color: '#000' }]}
            />

            <TextView style={{ color: '#000', fontSize: 14,  }}>
              Email address (optional):
            </TextView>
            <InputText
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              inputContainer={styles.inputContainer}
              inputStyle={styles.inputView}
            />
          </View>

          <View style={styles.buttonView}>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.PRIMARY[100],
                height: hp(6),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: hp(2),
              }}
              onPress={handleSubmit}
            >
              <TextView style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Submit
              </TextView>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

        {/* Bottom Sheet */}
        <ActionSheet id="image-picker-sheet">
          <View style={{ padding: 20, paddingBottom: 40 }}>
            <TextView style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 20,color:"#000"  }}>
              Choose Photo
            </TextView>

            <TouchableOpacity
              onPress={pickFromCamera}
              style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 12, marginBottom: 12, }}
            >
              <TextView style={{ textAlign: 'center', fontSize: 16,color:"#000" , }}>Take Photo</TextView>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickFromGallery}
              style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 12, marginBottom: 12 }}
            >
              <TextView style={{ textAlign: 'center', fontSize: 16, color:"#000"  }}>Choose from Gallery</TextView>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => SheetManager.hide('image-picker-sheet')}
              style={{ padding: 16 }}
            >
              <TextView style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>Cancel</TextView>
            </TouchableOpacity>
          </View>
        </ActionSheet>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default EditProfile;