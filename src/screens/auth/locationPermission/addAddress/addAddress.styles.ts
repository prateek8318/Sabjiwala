import { StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '../../../../constant';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  addressView: {
    width: wp(90),
    borderWidth: 1,
    borderColor: Colors.PRIMARY[400],
    borderRadius: 12,
    padding: hp(1),
    alignSelf: 'center',
    marginTop: hp(1),
  },
  txtAddress: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[500],
    marginVertical: hp(1),
    marginLeft: hp(1),
  },
  addressTypeContainer: {
    flexDirection: 'row',
    width: wp(75),
    justifyContent: 'space-between',
  },
  buttonView: {
    width: wp(90),
    alignSelf: 'center',
    justifyContent: 'center',   
    alignItems: 'center',
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  
  addressTypeButton: {
    flex: 1,
    paddingVertical: hp(0.5),   
    marginHorizontal: wp(1),
    borderWidth: 2,
    borderRadius: 30,
    alignItems: 'center',
  },
  
  addressTypeText: {
    ...Typography.H5Bold16,
    fontSize: 18,      // 👈 text size chhota
  },
  inputContainer: {
    flexDirection: 'row',
    width: wp(85),
    borderRadius: 12,
    marginTop: hp(1),
    borderWidth: 1,
    color: Colors.PRIMARY[400],
    height: hp(6),
    alignItems: 'center',
    alignSelf: 'center',
  },
  inputErrorBorder: {
    borderColor: Colors.ERROR[300],
    backgroundColor: '#FFF6F6',
  },
  inputView: {
    ...Typography.BodyRegular13,
    color: Colors.PRIMARY[400],
    height: hp(6),
    marginTop: 1,
    width: '90%', // keep text within container to avoid overflow
    paddingLeft: hp(2),
  },
 
  buttonTitle: {
    color: Colors.PRIMARY[200],
    ...Typography.H5Medium16,
    alignSelf: 'center',
    justifyContent: 'center',   
    alignItems: 'center',
  },
  
});

export default styles;
