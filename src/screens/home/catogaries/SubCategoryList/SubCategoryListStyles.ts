// styles/SubCategoryListStyles.ts (Final – Exactly like your screenshot with borders)

import { StyleSheet } from "react-native";
import { Colors } from "../../../../constant";

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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  // Filter Button (with border + icon)
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
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
    width: 80,
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
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  subTitleActive: {
    color: "#000",
    fontWeight: "600",
  },

 rightPane: {
  flex: 1,
  paddingHorizontal: 6,
  paddingLeft: 8,
    paddingTop: 8,
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
  padding: 8,
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