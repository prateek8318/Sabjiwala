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
    gap: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
    fontSize: 13,
    fontWeight: "700",
    color: "#228B22",
  },

  // Search Icon Button (with border)
  searchIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
    width: 75,
    backgroundColor: "#F7F7F7",
    paddingTop: 12,
  },

  subItem: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  subItemActive: {
    backgroundColor: "#fff",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 6,
  },
  subImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e0e0",
  },
  subTitle: {
    marginTop: 8,
    fontSize: 9.6,
    color: "#228B22",
    textAlign: "center",
  },
  subTitleActive: {
    color: "#228B22",
    fontWeight: "700",
  },

  rightPane: {
    flex: 1,
    paddingTop: 6,
    paddingHorizontal: -4, 
    marginLeft:-7,
    
  },
  productCardWrapper: {
    width: "50%",           // 2 cards perfect fit
    marginBottom: hp(.5),  
    paddingHorizontal: -4,
  },
searchHeader: {
  flexDirection: "row",
  color:'#000',
  alignItems: "center",
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: "#fff",
  borderBottomWidth: 1,
  borderColor: "#eee",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});