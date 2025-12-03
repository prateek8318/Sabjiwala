// styles/SubCategoryProductStyles.ts

import { StyleSheet } from "react-native";
import { Colors, Typography } from "../../../../constant";
import { 
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "../../../../constant/dimentions";

export default StyleSheet.create({

  productList: {
    flex: 1,
    marginBottom: hp(3),
  },

  card: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: hp(0.5),
    marginBottom: hp(2),
    alignSelf: "center",
    backgroundColor: Colors.PRIMARY[300],
    minWidth: 0,
    borderWidth: 1.2,
    borderColor: Colors.PRIMARY[100],
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: hp(18),
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderColor: Colors.PRIMARY[100],
  },

  flashIcon: {
    position: "absolute",
    top: hp(0.5),
    left: hp(0.5),
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  heartIcon: {
    position: "absolute",
    top: hp(1),
    right: hp(1),
  },

  trademarkIconWrapper: {
    position: "absolute",
    bottom: hp(1),
    right: hp(1),
  },

  trademarkIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  nameText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
    marginLeft: hp(1),
    marginTop: hp(1),
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hp(1),
    marginTop: hp(0.5),
  },

  priceText: {
    ...Typography.H5Medium16,
    color: Colors.PRIMARY[400],
  },

  oldPrice: {
    ...Typography.BodyRegular14,
    color: Colors.PRIMARY[400],
    textDecorationLine: "line-through",
  },

  offerView: {
    backgroundColor: Colors.PRIMARY[600],
    borderRadius: 50,
    paddingVertical: hp(0.5),
    paddingHorizontal: hp(1.5),
    marginLeft: hp(1),
    marginTop: hp(0.5),
    alignSelf: "flex-start",
  },

  offerTxt: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular12,
  },

  quantityView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: hp(1),
    marginBottom: hp(1),
    marginTop: hp(1),
  },

  ratingView: {
    flexDirection: "row",
    alignItems: "center",
  },

  txtRating: {
    ...Typography.BodyRegular13,
    color: "#000",
    fontWeight: "600",
    marginLeft: hp(1),
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: hp(1),
    marginRight: hp(2),
    marginBottom: hp(1),
  },

  addButton: {
    height: 40,
    width: 90,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY[500],
  },

  addText: {
    color: Colors.PRIMARY[300],
    ...Typography.H5Medium16,
    fontSize: 12,
  },

  optionView: {
    width: 80,
    height: 20,
    backgroundColor: Colors.PRIMARY[600],
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(0.5),
  },

  txtOption: {
    color: Colors.PRIMARY[400],
    ...Typography.BodyRegular13,
    fontSize: 12,
  },
});
