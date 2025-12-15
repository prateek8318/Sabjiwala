import React, { FC } from 'react';
import { Linking, SafeAreaView, ScrollView, Share, View } from 'react-native';
import styles from './inviteFriend.styles';
import {
  Colors,
} from '../../../../../../constant';
import {
  Header,
  LinearButton,
  TextView,
} from '../../../../../../components';

const InviteFriend: FC = () => {
  const referralCode = 'XYZ562639';
  const shareMessage = `Hey! Use my SabjiWala referral code ${referralCode} to sign up and we both earn rewards.`;

  const handleShareWhatsApp = async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    try {
      const isSupported = await Linking.canOpenURL(url);
      if (isSupported) {
        await Linking.openURL(url);
        return;
      }
    } catch (error) {
      console.log('WhatsApp share failed, falling back to system share', error);
    }

    await Share.share({ message: shareMessage });
  };

  const handleShareGeneric = async () => {
    try {
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Header />
        </View>

        <View style={styles.viewContainer}>
          <TextView style={styles.txtInvite}>Invite Your Friends</TextView>
          <View style={styles.inviteView}>
            <TextView style={styles.inviteCode}>{referralCode}</TextView>
          </View>
          <View style={styles.actionButtonView}>
            <LinearButton
              title="Whatsapp"
              //@ts-ignore
              titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
              style={styles.btnView}
              onPress={handleShareWhatsApp}
            />
            <LinearButton
              title="Others"
              //@ts-ignore
              titleStyle={[styles.buttonTitle, { color: Colors.PRIMARY[300] }]}
              style={styles.btnView}
              onPress={handleShareGeneric}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InviteFriend;
