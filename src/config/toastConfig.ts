import { Colors } from '../constant';
import { StyleSheet, View, Text } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '../constant/dimentions';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const toastConfig = {
  success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Icon name="check-circle" size={24} color="white" />
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Icon name="error" size={24} color="white" />
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Icon name="info" size={24} color="white" />
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3.5),
    borderRadius: 12,
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: hp(6),
  },
  successToast: {
    backgroundColor: '#4CAF50',
  },
  errorToast: {
    backgroundColor: '#F44336',
  },
  infoToast: {
    backgroundColor: '#2196F3',
  },
  textContainer: {
    marginLeft: wp(3),
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: '600',
    fontSize: wp(3.8),
    marginBottom: hp(0.3),
  },
  message: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: wp(3.4),
    fontWeight: '400',
  },
});
