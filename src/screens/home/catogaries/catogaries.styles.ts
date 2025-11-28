// import { StyleSheet } from 'react-native';
// import { Colors, Fonts, Typography } from '../../../constant';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from '../../../constant/dimentions';
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.PRIMARY[300],
//   },
//   itemCatMainView: {
//     width: wp(40),
//     height: hp(15),
//     margin: hp(2),
//     borderRadius: 12,
//   },
//   itemCatView: {
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//     alignItems: 'center',
//     width: wp(40),
//     position: 'absolute',
//     bottom: 0,
//     justifyContent: 'center',
//     paddingVertical: hp(1),
//   },
//   itemCatTxt: {
//     color: Colors.PRIMARY[300],
//     ...Typography.BodyMedium14,
//   },
// });
//
// export default styles;


import { StyleSheet, Dimensions } from 'react-native';
 import { Colors } from '../../../constant';

 const { width } = Dimensions.get('window');
 const ITEM_WIDTH = (width - 48) / 2;

 export default StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: '#fff',
   },
   flatListContent: {
     paddingHorizontal: 16,
     paddingTop: 16,
     paddingBottom: 20,
   },
   columnWrapper: {
     justifyContent: 'space-between',
   },
   itemCatMainView: {
     marginBottom: 16,
     borderRadius: 12,
     overflow: 'hidden',
     elevation: 3,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     backgroundColor: '#fff',
   },
   itemCatView: {
     alignItems: 'center',
     padding: 10,
   },
   categoryImage: {
     width: '100%',
     height: 100,
     borderRadius: 10,
     backgroundColor: '#f0f0f0',
   },
   itemCatTxt: {
     marginTop: 8,
     fontSize: 15,
     fontWeight: '600',
     color: Colors.TEXT_DARK,
     textAlign: 'center',
   },
   loaderContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
   },
   emptyContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     paddingHorizontal: 30,
   },
   emptyText: {
     fontSize: 16,
     color: Colors.TEXT_LIGHT,
     textAlign: 'center',
   },
 });