import { StyleSheet } from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "../../constant/dimentions";
import { Colors, Typography } from "../../constant";


const styles = StyleSheet.create({
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: wp(80),
      marginVertical: wp(2),
    },
    otpInput: {
      borderBottomWidth:1,
      borderBottomColor: Colors.PRIMARY[300], 
      width: wp(16), 
      height: hp(8), 
      color:Colors.PRIMARY[300],
      textAlign: 'center', 
      marginHorizontal: 5, 
      ...Typography.H5Medium16,
     
    },
    focusedOtpInput: {
       borderBottomWidth:1,
      borderBottomColor: Colors.PRIMARY[300], 
    },
  });
  
  export default styles;
  