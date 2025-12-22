// styles/SubCategoryListStyles.ts (Final – Exactly like your screenshot with borders)

import { StyleSheet } from "react-native";
import { Colors } from "../../../../constant";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "../../../../constant/dimentions";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Top Action Bar (Sort | Filter + Search Icon)
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Sort Button (with border + icon)
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignSelf: "flex-start",
  },

  // Filter Button (with border + icon)
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#228B22",
    
  },

  // Search Icon Button (with border)
  searchIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C7E6AB',
    justifyContent: "center",
    alignItems: "center",
    
  },

  // Illustration when search is active
  searchIllustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    
  },
  searchIllustration: {
    width: 341.84,
    height: 351.34,
    resizeMode: "contain",
  },

  // Main Content (Left Sidebar + Right Products)
  contentRow: {
    flex: 1,
    flexDirection: "row",
  },

  leftPane: {
    width: wp(18),
    backgroundColor: "#fff",
    paddingTop: hp(1.5),
  },

  subItem: {
    alignItems: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(2),
  },
  subItemActive: {
    backgroundColor: "#fff",
    
  },
  subImage: {
    width: wp(10.5),
    height: wp(10.5),
    borderRadius: wp(5.25),
    backgroundColor: "#e0e0e0",
  },
  subImageActive: {
    width: wp(13.5),
    height: wp(13.5),
    borderRadius: wp(6.75),
  },
  subTitle: {
    marginTop: 6,
    fontSize: 9,
    color: "#228B22",
    textAlign: "center",
  },
  subTitleActive: {
    color: "#228B22",
    fontWeight: "700",
  },
  activeUnderline: {
    marginTop: 5,
    width: wp(12),
    height: 3,
    borderRadius: 2,
    backgroundColor: "#1B5E20",
  },

  rightPane: {
    flex: 1,
    paddingTop: hp(0.5),
    
    marginLeft: -8,
    paddingBottom: 0,
    
  },
  sortFilterContainer: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(1),
    marginBottom: 4,
  },
  productCardWrapper: {
    width: "49%",
  
  },
searchHeader: {
  flexDirection: "row",
  color:'#000',
  alignItems: "center",
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: "#fff",
  borderBottomWidth: 1,
  borderColor: "#ccc",
},

searchBackBtn: {
  padding: 6,
},

searchInput: {
  flex: 1,
  color:'#000',
  fontSize: 16,
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: "#f5f5f5",
  borderRadius: 30,
  marginHorizontal: 10,
},

noResultContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 100,
},

  loaderContainer: {
    
  },
  shimmerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingBottom: hp(5),
  },
  shimmerCardWrapper: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: hp(1.2),
  },
  shimmerImage: {
    height: hp(14),
    borderRadius: 12,
    backgroundColor: "#e6e6e6",
  },
  shimmerInfo: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  shimmerLinePrimary: {
    height: 12,
    borderRadius: 8,
    backgroundColor: "#e6e6e6",
    width: "78%",
  },
  shimmerLineSecondary: {
    height: 10,
    borderRadius: 8,
    backgroundColor: "#e6e6e6",
    width: "62%",
  },
  shimmerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  shimmerChip: {
    flex: 1,
    height: 12,
    borderRadius: 20,
    backgroundColor: "#e6e6e6",
  },
  shimmerChipSmall: {
    width: 50,
    height: 12,
    borderRadius: 20,
    backgroundColor: "#e6e6e6",
  },
  shimmerBase: {
    overflow: "hidden",
    backgroundColor: "#e6e6e6",
  },

  // Floating Cart Button
  floatingCartButton: {
    position: "absolute",
    bottom: hp(7), // lifted above bottom tab bar to match Figma spacing
    alignSelf: "center",
    zIndex: 1000,
  },
  cartGradient: {
    borderRadius: 30,
    paddingLeft: wp(7), // space for overlapping image
    paddingRight: wp(3),
    paddingVertical: hp(1.1),
    minWidth: wp(45),
    maxWidth: wp(90),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cartButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2.5),
  },
  cartTextBlock: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginHorizontal: wp(2),
  },
  stackedImagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -wp(4), // pull image outside left edge
  },
  cartProductImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#015304",
  },
  stackedImage: {
    marginLeft: -wp(6),
  },
  cartProductImage: {
    width: "100%",
    height: "100%",
  },
  cartProductImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1B5E20",
    justifyContent: "center",
    alignItems: "center",
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Poppins-SemiBold",
  },
  cartButtonSubText: {
    color: "#E8F5E9",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  arrowCircle: {
    
  },
});