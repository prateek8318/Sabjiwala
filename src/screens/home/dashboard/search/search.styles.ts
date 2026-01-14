import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  inputView: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[100],
    width: wp(90),
    top: hp(0.5),
    paddingLeft: hp(1),
  },
  searchBox: {
    width: wp(90),
    borderColor: Colors.PRIMARY[400],
    borderWidth: 1,
    alignSelf: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: hp(2),
  },
  imgSearchView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgSearch: {
    width: wp(100),
    height: hp(40),
    resizeMode: 'contain',
  },
  // Voice Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  listeningText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#000',
  },
  voiceWave: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  wave: {
    width: 4,
    backgroundColor: Colors.PRIMARY[100],
    marginHorizontal: 2,
    borderRadius: 10,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARY[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 5,
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#c90b0bff',
    borderRadius: 12,
  },
  cancelText: {
    color: Colors.PRIMARY[300],
    fontWeight: 'bold',
  },
});

export default styles;
