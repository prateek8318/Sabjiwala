import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { Header, TextView } from "../../../../components";
import ApiService from "../../../../service/apiService";
import { Colors, Icon } from "../../../../constant";
import { widthPercentageToDP as wp } from "../../../../constant/dimentions";
import styles from "../SubCategoryList/SubCategoryListStyles";
import ProductCard from "../../dashboard/components/ProductCard/productCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const LEFT_PANE_WIDTH = 79;
const RIGHT_PANE_PADDING = 12;
const CARD_GAP = 1; // Space between cards
const CONTAINER_PADDING = 0; // No padding to maximize space for cards

// Calculate card width percentage for right pane (with left sidebar)
const getCardWidthPercent = () => {
  // rightPane has paddingLeft: 8, paddingHorizontal: 6
  // So: left = 8, right = 6
  const rightPaneLeftPadding = 6;
  const rightPaneRightPadding = 2;
  const availableWidth = SCREEN_WIDTH - LEFT_PANE_WIDTH - rightPaneLeftPadding;
  const totalPadding = CONTAINER_PADDING * 1; // Left and right padding from columnWrapperStyle
  const usableWidth = availableWidth - totalPadding - CARD_GAP; // Subtract gap between cards
  // Return as percentage - each card gets slightly less than 50% to ensure spacing
  return (usableWidth / 2 / availableWidth) * 100;
};

// Calculate card width percentage for full screen (search mode)
const getFullScreenCardWidthPercent = () => {
  const availableWidth = SCREEN_WIDTH;
  const totalPadding = CONTAINER_PADDING * 2; // Left and right padding
  const usableWidth = availableWidth - totalPadding - CARD_GAP;
  // Return as percentage - each card gets slightly less than 50% to ensure spacing
  return (usableWidth / 2 / availableWidth) * 100;
};

const SubCategoryList = ({ route }: any) => {
  const { categoryId, categoryName } = route.params;

  const [loading, setLoading] = useState(true);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sort & Filter States
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [filterTypes, setFilterTypes] = useState<string[]>([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const transformToCardItem = (product: any) => {
    const variant = product.ProductVarient?.[0] || product.variants?.[0] || product.variant;
    const rawImage = variant?.images?.[0] || product.primary_image?.[0] || product.images?.[0] || product.image;
    const image = rawImage ? ApiService.getImage(rawImage) : "";
    const varCount = product.ProductVarient?.length || product.variants?.length || 0;

    return {
      id: product._id,
      name: product.productName || product.name,
      image,
      price: variant?.price ?? product.price ?? 0,
      oldPrice: variant?.originalPrice ?? product.mrp ?? 0,
      discount: variant?.discount ? `₹${variant.discount} OFF` : "",
      weight: variant ? `${variant.stock || 1} ${variant.unit || ""}` : product.weight || "",
      rating: product.rating || 4.5,
      options: varCount > 0 ? `${varCount} Option${varCount > 1 ? "s" : ""}` : "",
      variants: product.ProductVarient || product.variants || [],
    };
  };

  const loadProductsForSub = async (subId: string) => {
    try {
      setProductLoading(true);
      const res = await ApiService.getSubCategoryProducts(subId);
      if (res?.status === 200 && res?.data) {
        const apiData = (res.data as any).paginateData || (res.data as any).products || [];
        const cardItems = Array.isArray(apiData) ? apiData.map(transformToCardItem) : [];

        setAllProducts(cardItems);
        setProducts(cardItems);

        // Dynamic types extract karo
        const uniqueTypes = [...new Set(cardItems.map(item =>
          item.name.split(' ').slice(0, 2).join(' ').toLowerCase()
        ))].slice(0, 5); // Sirf first 2 words + max 5 types
        setFilterTypes(uniqueTypes);

      } else {
        setAllProducts([]);
        setProducts([]);
        setFilterTypes([]);
      }
    } catch (err) {
      setAllProducts([]);
      setProducts([]);
      setFilterTypes([]);
    } finally {
      setProductLoading(false);
    }
  };

  const loadSubCategories = async () => {
    try {
      const res = await ApiService.getSubCategoryList(categoryId);
      if (res?.status === 200 && res?.data) {
        const apiData = res.data.subCategoryData || res.data.data || [];
        if (Array.isArray(apiData) && apiData.length > 0) {
          setSubCategories(apiData);
          setSelectedSubId(apiData[0]._id);
          loadProductsForSub(apiData[0]._id);
        } else {
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
      }
    } catch (err) {
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) loadSubCategories();
    else setLoading(false);
  }, [categoryId]);

  // Search + Filter + Sort Logic
  useEffect(() => {
    let filtered = [...allProducts];

    // Search
    if (isSearching && searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type Filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item =>
        selectedTypes.some(type => item.name.toLowerCase().includes(type.toLowerCase()))
      );
    }

    // Sort
    if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "discount") filtered.sort((a, b) => (b.oldPrice - b.price) - (a.oldPrice - a.price));

    setProducts(filtered);
  }, [allProducts, searchQuery, isSearching, selectedTypes, sortBy]);

  const toggleFilter = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSortBy("relevance");
  };

  const renderSubItem = ({ item }: any) => {
    const img = item.image ? ApiService.getImage(item.image) : "https://via.placeholder.com/300x150.png?text=No+Image";
    const isSelected = selectedSubId === item._id;

    return (
      <Pressable
        onPress={() => {
          setSelectedSubId(item._id);
          loadProductsForSub(item._id);
          setIsSearching(false);
        }}
        style={[styles.subItem, isSelected && styles.subItemActive]}
      >
        <Image source={{ uri: img }} style={styles.subImage} resizeMode="cover" />
        <TextView style={[styles.subTitle, isSelected && styles.subTitleActive]} numberOfLines={2}>
          {item.name || "Unnamed"}
        </TextView>
      </Pressable>
    );
  };

  const handleAddPress = (item: any) => {
    if (item?.variants && item.variants.length > 1) {
      setSelectedProduct(item);
      setShowVariantModal(true);
    } else {
      addToCart(item, item.variants?.[0]);
    }
  };

  const addToCart = (product: any, variant: any) => {
    console.log("Added to cart:", product.name, variant);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={categoryName || "Sub Categories"} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : subCategories.length === 0 ? (
        <View style={styles.loaderContainer}>
          <TextView>No subcategories found</TextView>
        </View>
      ) : (
        <>
          <View style={styles.actionRow}>
            <View style={styles.sortFilterRow}>
              <Pressable style={styles.sortButton} onPress={() => setShowSortFilter(true)}>
                <Icon name="swap-vertical" family="MaterialCommunityIcons" size={16} color="#000" />
                <TextView style={styles.actionText}>Sort</TextView>
              </Pressable>
              <Pressable style={styles.filterButton} onPress={() => setShowSortFilter(true)}>
                <Icon name="filter-variant" family="MaterialCommunityIcons" size={18} color="#000" />
                <TextView style={styles.actionText}>Filter</TextView>
              </Pressable>
            </View>

            <Pressable style={styles.searchIconButton} onPress={() => { setIsSearching(true); setSearchQuery(""); }}>
              <Icon name="search" size={22} color="#000" />
            </Pressable>
          </View>

          {/* SEARCH MODE */}
          {isSearching ? (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={styles.searchHeader}>
                <Pressable onPress={() => setIsSearching(false)} style={{ padding: 8 }}>
                  <Icon name="arrow-left" family="Feather" size={26} color="#000" />
                </Pressable>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor="#000"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery ? (
                  <Pressable onPress={() => setSearchQuery("")} style={{ padding: 10 }}>
                    <Icon name="close" size={20} color="#000" />
                  </Pressable>
                ) : null}
              </View>

              {searchQuery.trim() === "" ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Image source={require("../../../../assets/images/search.png")} style={{ width: 300, height: 400 }} resizeMode="contain" />
                  <TextView style={{ marginTop: 20, fontSize: 16, color: "#999" }}>Start typing to search products</TextView>
                </View>
              ) : products.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Image source={require("../../../../assets/images/search.png")} style={{ width: 140, height: 140, opacity: 0.5 }} resizeMode="contain" />
                  <TextView style={{ marginTop: 20, fontSize: 16, color: "#999" }}>No products found</TextView>
                </View>
              ) : (
                <FlatList
                  data={products}
                  numColumns={2}
                  columnWrapperStyle={{ 
                    justifyContent: "space-between", 
                    paddingHorizontal: CONTAINER_PADDING,
                  }}
                  contentContainerStyle={{ paddingVertical: 16 }}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    return (
                      <View
                        style={{
                          width: "49%",
                          marginBottom: 10,
                        }}
                      >
                        <ProductCard cardArray={[item]} horizontal={false} numOfColumn={1} onAddPress={handleAddPress} />
                      </View>
                    );
                  }}
                />
              )}
            </View>
          ) : (
            <View style={styles.contentRow}>
              <View style={styles.leftPane}>
                <FlatList data={subCategories} renderItem={renderSubItem} keyExtractor={(item) => item._id} showsVerticalScrollIndicator={false} />
              </View>

              <View style={styles.rightPane}>
                {productLoading ? (
                  <ActivityIndicator size="large" color="#4CAF50" />
                ) : products.length === 0 ? (
                  <TextView style={{ textAlign: "center", marginTop: 50, color: "#999" }}>No products found</TextView>
                ) : (
                  <FlatList
                    data={products}
                    numColumns={2}
                    columnWrapperStyle={{ 
                      justifyContent: "space-between", 
                      paddingHorizontal: CONTAINER_PADDING,
                    }}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      return (
                        <View
                          style={{
                            width: "49%",
                            marginBottom: 10,
                          }}
                        >
                          <ProductCard cardArray={[item]} horizontal={false} numOfColumn={1} onAddPress={handleAddPress} />
                        </View>
                      );
                    }}
                  />
                )}
              </View>
            </View>
          )}
        </>
      )}

      <Modal visible={showSortFilter} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}>
              <Pressable onPress={() => setShowSortFilter(false)}>
                <Icon name="close" size={26} color="#000" />
              </Pressable>
              <TextView style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>Sort & Filter</TextView>
              <Pressable onPress={clearAllFilters}>
                <TextView style={{ color: "#4CAF50", fontWeight: "600" }}>Clear All</TextView>
              </Pressable>
            </View>

            <ScrollView>
              <View style={{ padding: 16 }}>
                <TextView style={{ fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#000" }}>Type</TextView>
                {filterTypes.length > 0 ? (
                  filterTypes.map((item) => (
                    <Pressable key={item} onPress={() => toggleFilter(item)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
                      <View style={{
                        width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#4CAF50",
                        marginRight: 12, justifyContent: "center", alignItems: "center",
                        backgroundColor: selectedTypes.includes(item) ? "#4CAF50" : "#fff"
                      }}>
                        {selectedTypes.includes(item) && <Icon name="checkmark" size={16} color="#fff" />}
                      </View>
                      <TextView style={{ color: "#000" }}>{item.charAt(0).toUpperCase() + item.slice(1)} ({Math.floor(Math.random() * 15) + 5})</TextView>
                    </Pressable>
                  ))
                ) : (
                  <TextView style={{ fontSize: 14, color: "#999", textAlign: "center", paddingVertical: 20 }}>No types available</TextView>
                )}
              </View>

              <View style={{ height: 8, backgroundColor: "#f5f5f5" }} />

              <View style={{ padding: 16 }}>
                <TextView style={{ fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#000" }}>Sort by</TextView>
                {[
                  { label: "Relevance", value: "relevance" },
                  { label: "Price (Low to High)", value: "price_asc" },
                  { label: "Price (High to Low)", value: "price_desc" },
                  { label: "Discount (High to Low)", value: "discount" },
                ].map((opt) => (
                  <Pressable key={opt.value} onPress={() => setSortBy(opt.value)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
                    <View style={{
                      width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#4CAF50",
                      marginRight: 12, justifyContent: "center", alignItems: "center",
                      backgroundColor: sortBy === opt.value ? "#4CAF50" : "#fff"
                    }}>
                      {sortBy === opt.value && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" }} />}
                    </View>
                    <TextView style={{ color: "#000" }}>{opt.label}</TextView>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", padding: 16, borderTopWidth: 1, borderColor: "#eee" }}>
              <Pressable onPress={clearAllFilters} style={{ flex: 1, paddingVertical: 14 }}>
                <TextView style={{ textAlign: "center", color: "#4CAF50", fontWeight: "600" }}>Clear Filters</TextView>
              </Pressable>
              <Pressable
                onPress={() => setShowSortFilter(false)}
                style={{ flex: 2, backgroundColor: "#4CAF50", paddingVertical: 14, borderRadius: 30, marginLeft: 10 }}
              >
                <TextView style={{ textAlign: "center", color: "#fff", fontWeight: "700" }}>Apply</TextView>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Variant Modal */}
      <Modal visible={showVariantModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Pressable onPress={() => setShowVariantModal(false)} style={{ alignSelf: "center", marginBottom: 10 }}>
              <TextView style={{ fontSize: 26 }}>×</TextView>
            </Pressable>
            {selectedProduct?.variants?.map((v: any, i: number) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, marginBottom: 10 }}>
                <Image source={{ uri: selectedProduct.image }} style={{ width: 55, height: 55, borderRadius: 8 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <TextView>{selectedProduct.name}</TextView>
                  <TextView style={{ fontSize: 13, color: "#666" }}>{v.stock || v.weight} {v.unit || "kg"}</TextView>
                </View>
                <View>
                  <TextView>₹{v.price}</TextView>
                  {v.originalPrice && <TextView style={{ textDecorationLine: "line-through", fontSize: 12 }}>₹{v.originalPrice}</TextView>}
                </View>
                <Pressable onPress={() => { addToCart(selectedProduct, v); setShowVariantModal(false); }} style={{ backgroundColor: "#1B5E20", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginLeft: 10 }}>
                  <TextView style={{ color: "white" }}>Add</TextView>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SubCategoryList;