import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import { Header, TextView } from "../../../../components";
import ApiService from "../../../../service/apiService";
import { Colors, Icon } from "../../../../constant";
import { widthPercentageToDP as wp,heightPercentageToDP as hp } from "../../../../constant/dimentions";
import styles from "../SubCategoryList/SubCategoryListStyles";
import ProductCard from "../../dashboard/components/ProductCard/productCard";
const TAB_BAR_BASE_STYLE = {
  height: 80,
  borderTopWidth: 0,
  backgroundColor: "transparent",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const LEFT_PANE_WIDTH = 74;
const RIGHT_PANE_PADDING = 12;
const CARD_GAP = 1; // Space between cards
const CONTAINER_PADDING = 0; // No padding to maximize space for cards

// Calculate card width percentage for right pane (with left sidebar)
const getCardWidthPercent = () => {
  // rightPane has paddingLeft: 8, paddingHorizontal: 6
  // So: left = 8, right = 6
  const rightPaneLeftPadding = 4;
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
  const totalPadding = CONTAINER_PADDING * 1; // Left and right padding
  const usableWidth = availableWidth - totalPadding - CARD_GAP;
  // Return as percentage - each card gets slightly less than 50% to ensure spacing
  return (usableWidth / 2 / availableWidth) * 100;
};

const SubCategoryList = ({ route }: any) => {
  const { categoryId, categoryName } = route.params;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

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

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Cart state for floating button
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [recentlyAddedProducts, setRecentlyAddedProducts] = useState<any[]>([]);
  const cartItemCount =
    (cartItems || []).reduce((sum, item) => sum + (item?.quantity || 1), 0) ||
    recentlyAddedProducts.length;
  const lastScrollY = useRef(0);

  const ShimmerPlaceholder = ({ style }: { style?: any }) => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }, [shimmerValue]);

    const translateX = shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 120],
    });

    return (
      <View style={[styles.shimmerBase, style]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={["#f0f0f0", "#e2e2e2", "#f0f0f0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    );
  };

  const renderShimmerGrid = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.shimmerGrid}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <View key={idx} style={styles.shimmerCardWrapper}>
          <ShimmerPlaceholder style={styles.shimmerImage} />
          <View style={styles.shimmerInfo}>
            <ShimmerPlaceholder style={styles.shimmerLinePrimary} />
            <ShimmerPlaceholder style={styles.shimmerLineSecondary} />
            <View style={styles.shimmerRow}>
              <ShimmerPlaceholder style={styles.shimmerChip} />
              <ShimmerPlaceholder style={styles.shimmerChipSmall} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

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
      setAllProducts([]);
      setProducts([]);
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

  // Load cart data for floating button
  const loadCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const res = await ApiService.getCart();
      const cartData =
        res?.data?.cart?.products ||
        res?.data?.products ||
        res?.data?.items ||
        res?.data?.data?.items ||
        [];
      const newCartItems = Array.isArray(cartData) ? cartData : [];
      setCartItems(newCartItems);

      // 🔹 Critical fix: Jab cart empty ho jaye, recentlyAddedProducts bhi clear kar do
      if (newCartItems.length === 0) {
        setRecentlyAddedProducts([]);
      } else if (recentlyAddedProducts.length > 0) {
        // Sirf delay se clear karo jab cart me items ho (animation ke liye)
        setTimeout(() => setRecentlyAddedProducts([]), 1200);
      }
    } catch (err) {
      console.log("Cart load error:", err);
      setCartItems([]);
      setRecentlyAddedProducts([]); // Error par bhi clear
    } finally {
      setCartLoading(false);
    }
  }, [recentlyAddedProducts.length]);

  // Refresh cart when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation, loadCart]);

  // Also load cart on initial mount
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

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

  // Always hide bottom tab bar on this screen (SubCategory product index)
  useEffect(() => {
    const tabNavigator = navigation.getParent?.();
    if (!tabNavigator) return;

    if (isFocused) {
      tabNavigator.setOptions({
        tabBarStyle: [{ ...TAB_BAR_BASE_STYLE }, { display: "none" }],
      });
    } else {
      tabNavigator.setOptions({
        tabBarStyle: TAB_BAR_BASE_STYLE,
      });
    }

    return () => {
      tabNavigator.setOptions({ tabBarStyle: TAB_BAR_BASE_STYLE });
    };
  }, [isFocused, navigation]);

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSortBy("relevance");
  };

  const renderSubItem = ({ item }: any) => {
    const img = item.image ? ApiService.getImage(item.image) : "https://via.placeholder.com/300x150.png?text=No+Image";
    console.log('SubCategoryList Image → id:', item?._id, '| name:', item?.name, '| raw:', item?.image, '| final:', img);
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
        <Image
          source={{ uri: img }}
          style={[styles.subImage, isSelected && styles.subImageActive]}
          resizeMode="cover"
        />
        <TextView style={[styles.subTitle, isSelected && styles.subTitleActive]} numberOfLines={2}>
          {item.name || "Unnamed"}
        </TextView>
        {isSelected && <View style={styles.activeUnderline} />}
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

  // Handle product added callback from ProductCard
  const handleProductAdded = (product: any) => {
  if (product?.removed) {
    // Remove hone par recentlyAddedProducts se hatao
    setRecentlyAddedProducts(prev =>
      prev.filter(p => (p.id || p._id) !== (product.id || product._id))
    );
    return;
  }

  // Add hone par (normal case)
  const getProductImage = (p: any) => {
    return p?.image ||
           p?.primary_image?.[0] ||
           p?.images?.[0] ||
           p?.variants?.[0]?.images?.[0] ||
           p?.ProductVarient?.[0]?.images?.[0] ||
           p?.variant?.images?.[0];
  };
    
    const productImage = getProductImage(product);
  const imageUrl = productImage
    ? productImage.startsWith('http')
      ? productImage
      : ApiService.getImage(productImage)
    : '';

  const productWithImage = { ...product, image: imageUrl };

  setRecentlyAddedProducts(prev => {
    const filtered = prev.filter(p => (p.id || p._id) !== (product.id || product._id));
    return [productWithImage, ...filtered].slice(0, 3);
  });
    
    // Immediately update cart items optimistically
    const newCartItem = {
    productId: {
      _id: product.id || product._id,
      name: product.name,
      images: [product.image || product.variants?.[0]?.images?.[0] || product.ProductVarient?.[0]?.images?.[0]].filter(Boolean),
    },
    quantity: 1,
  };
    setCartItems(prev => {
    const existingIndex = prev.findIndex(
      item => (item.productId?._id || item.productId) === (product.id || product._id)
    );
    if (existingIndex >= 0) {
      const updated = [...prev];
      updated[existingIndex].quantity += 1;
      return updated;
    }
    return [newCartItem, ...prev];
  });
    
    // Refresh cart from API in background
    loadCart();
  };

  // Update cart quantity with optimistic updates (instant response)
  const updateCartQty = async (
    productId: string,
    variantId: string | undefined,
    qty: number,
    productItem?: any,
  ) => {
    const pid = productId?.toString();
    if (!pid) {
      console.log('updateCartQty: No productId provided');
      return;
    }

    const vid = variantId ? variantId.toString() : undefined;
    
    try {
      // 🔹 OPTIMISTIC UPDATE - Update UI immediately before API call
      setCartItems(prev => {
        const existingIndex = prev.findIndex((item: any) => {
          const itemProductId = item?.productId?._id || item?.productId || item?._id || item?.id || '';
          const itemVariantId = item?.variantId?._id || item?.variantId || undefined;
          return itemProductId === pid && itemVariantId === vid;
        });

        if (qty > 0) {
          if (existingIndex >= 0) {
            // Update existing item quantity
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: qty,
            };
            return updated;
          } else {
            // Add new item
            const newCartItem = {
              productId: {
                _id: pid,
                name: productItem?.name || '',
                images: [productItem?.image || productItem?.variants?.[0]?.images?.[0] || productItem?.ProductVarient?.[0]?.images?.[0]].filter(Boolean),
              },
              variantId: vid,
              quantity: qty,
            };
            return [...prev, newCartItem];
          }
        } else {
          // Remove item (qty = 0)
          if (existingIndex >= 0) {
            return prev.filter((_, index) => index !== existingIndex);
          }
          return prev;
        }
      });

      // Make API call
      if (qty > 0) {
        await ApiService.addToCart(pid, vid, qty.toString());
        
        // Notify parent only when adding first item (qty === 1)
        if (productItem && qty === 1) {
          handleProductAdded(productItem);
        }
      } else {
        await ApiService.removeCartItem(pid, vid);
        
        // Notify parent that product was removed
        if (productItem) {
          handleProductAdded({ ...productItem, removed: true });
        }
      }
      
      // Refresh cart to ensure sync with server
      await loadCart();
    } catch (e) {
      console.error('updateCartQty error:', e);
      // Revert to previous state by refreshing from server
      await loadCart();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={categoryName || "Sub Categories"}
        isBack={false}
        rightIcon={true}
        rightIconPress={() => { setIsSearching(true); setSearchQuery(""); }}
        rightIconComponent={
          <View style={styles.searchIconButton}>
            <Icon name="search" family="Feather" size={22} color="#000" />
          </View>
        }
      />

      {loading ? (
        renderShimmerGrid()
      ) : subCategories.length === 0 ? (
        <View style={styles.loaderContainer}>
          <TextView>No subcategories found</TextView>
        </View>
      ) : (
        <>

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
                    <Icon name="close" family="Feather" size={20} color="#000" />
                  </Pressable>
                ) : null}
              </View>

              {searchQuery.trim() === "" ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <TextView style={{ marginTop: 0, fontSize: 16, color: "#999" }}>Start typing to search products</TextView>
                  <Image source={require("../../../../assets/images/search.png")} style={{ width: 250, height: 300 }} resizeMode="contain" />
                  
                </View>
              ) : productLoading ? (
                renderShimmerGrid()
              ) : products.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Image source={require("../../../../assets/images/search.png")} style={{ width: 140, height: 120, opacity: 0.5 }} resizeMode="contain" />
                  <TextView style={{ marginTop: 0, fontSize: 16, color: "#999" }}>No products found</TextView>
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
                        <ProductCard
                          cardArray={[item]}
                          horizontal={false}
                          numOfColumn={1}
                          type="OFFER"
                          onProductAdded={handleProductAdded}
                        />
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
                <View style={styles.sortFilterContainer}>
                  <Pressable style={styles.sortButton} onPress={() => setShowSortFilter(true)}>
                    <TextView style={styles.actionText}>Sort</TextView>
                    <Icon name="swap-vertical" family="MaterialCommunityIcons" size={14} color="#228B22" />
                  </Pressable>
                </View>
                {productLoading ? (
                  renderShimmerGrid()
                ) : (
                <FlatList
                    data={products}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={{ paddingBottom: 0 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.productCardWrapper}>
                        <ProductCard
                          cardArray={[item]}
                          horizontal={false}
                          numOfColumn={2}
                          type="OFFER"
                          onProductAdded={handleProductAdded}
                        />
                      </View>
                    )}
                  />
                )}
              </View>
            </View>
          )}
        </>
      )}

      <Modal visible={showSortFilter} transparent animationType="fade" onRequestClose={() => setShowSortFilter(false)}>
        <TouchableWithoutFeedback onPress={() => setShowSortFilter(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={{ 
                backgroundColor: "#fff", 
                borderTopLeftRadius: 16, 
                borderTopRightRadius: 16, 
                paddingBottom: 0, // Remove extra padding
                maxHeight: "90%" 
              }}>
            <ScrollView>
              <View style={{ padding: 16 }}>
                <TextView style={{ fontSize: 16, fontWeight: "600", marginBottom: 12, color: Colors.PRIMARY[100] }}>Sort by</TextView>
                {[
                  { label: "Relevance", value: "relevance" },
                  { label: "Price (Low to High)", value: "price_asc" },
                  { label: "Price (High to Low)", value: "price_desc" },
                  { label: "Discount (High to Low)", value: "discount" },
                ].map((opt) => (
                  <Pressable 
                    key={opt.value} 
                    onPress={() => {
                      setSortBy(opt.value);
                      setShowSortFilter(false);
                    }} 
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}
                  >
                    <View style={{
                      width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "#000",
                      marginRight: 12, justifyContent: "center", alignItems: "center",
                      backgroundColor: sortBy === opt.value ? Colors.PRIMARY[100] : "#fff"
                    }}>
                      {sortBy === opt.value && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" }} />}
                    </View>
                    <TextView style={{ color: "#000" }}>{opt.label}</TextView>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Variant Modal */}
      <Modal 
        visible={showVariantModal} 
        transparent 
        animationType="slide"
        onRequestClose={() => setShowVariantModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <Pressable 
            style={{ flex: 1 }} 
            onPress={() => setShowVariantModal(false)}
          />
          <View style={{ backgroundColor: "white", borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingBottom: 0 }}>
            <Pressable 
              onPress={() => setShowVariantModal(false)} 
              style={{ padding: 16, alignSelf: "flex-end" }}
            >
              <TextView style={{ fontSize: 28, color: "#666" }}>×</TextView>
            </Pressable>
            {selectedProduct?.variants?.map((v: any, i: number) => {
              const pid = selectedProduct?.id || selectedProduct?._id;
              const vid = v?._id;
              
              // Look up quantity from cartItems by matching both productId and variantId
              const findCartItem = (item: any) => {
                const itemProductId = item?.productId?._id || item?.productId || item?._id || item?.id || '';
                const itemVariantId = item?.variantId?._id || item?.variantId || undefined;
                return itemProductId === pid && itemVariantId === vid;
              };
              
              const matchingCartItem = cartItems.find(findCartItem);
              const quantity = matchingCartItem?.quantity || 0;

              return (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, marginBottom:
                i === selectedProduct.variants.length - 1 ? 0 : 10, gap: 12 }}>
                  <Image source={{ uri: selectedProduct.image }} style={{ width: 60, height: 55, borderRadius: 8 }} />
                  <View style={{ flex: 1 }}>
                    <TextView>{selectedProduct.name}</TextView>
                    {/* Weight and Price in same row */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      <TextView style={{ fontSize: 13, color: "#666" }}>{v.stock || v.weight} {v.unit || "kg"}</TextView>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextView style={{ fontWeight: "700" }}>₹{v.price}</TextView>
                        {v.originalPrice && <TextView style={{ textDecorationLine: "line-through", fontSize: 12, marginLeft: 8,  }}>₹{v.originalPrice}</TextView>}
                      </View>
                    </View>
                  </View>
                  
                  {/* Quantity Controls or Add Button */}
                  {quantity > 0 ? (
                    <LinearGradient
                      colors={["#5A875C", "#015304"]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 20,
                        paddingHorizontal: 2,
                        paddingVertical: 4,
                        minWidth: 60,
                        justifyContent: "space-between"
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          if (!pid) return;
                          updateCartQty(pid, vid, quantity - 1, selectedProduct);
                        }}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        <Text style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}>-</Text>
                      </Pressable>

                      <Text style={{ minWidth: 20, textAlign: "center", fontWeight: "700", color: "#fff", fontSize: 14 }}>
                        {quantity}
                      </Text>

                      <Pressable
                        onPress={() => {
                          if (!pid) return;
                          updateCartQty(pid, vid, quantity + 1, selectedProduct);
                        }}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        <Text style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}>+</Text>
                      </Pressable>
                    </LinearGradient>
                  ) : (
                    <Pressable
                      onPress={async () => {
                        if (!pid) return;
                        await updateCartQty(pid, vid, 1, selectedProduct);
                      }}
                      style={{ borderRadius: 20, overflow: "hidden" }}
                    >
                      <LinearGradient
                        colors={["#5A875C", "#015304"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingVertical: 4, paddingHorizontal: 14, borderRadius: 20 }}
                      >
                        <TextView style={{ color: "white" }}>Add</TextView>
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (products.length > 0 || subCategories.length > 0) && (
        <Pressable
          onPress={() => {
            navigation.navigate("BottomStackNavigator", { screen: "Cart" });
          }}
          style={styles.floatingCartButton}
        >
          <LinearGradient
            colors={["#5A875C", "#015304"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cartGradient}
          >
          <View style={styles.cartButtonContent}>
            {/* Stacked Product Images */}
            <View style={styles.stackedImagesContainer}>
              {(() => {
                // Use recently added products if available, otherwise use cart items
                let productsToShow: any[] = [];
                
                if (recentlyAddedProducts.length > 0) {
                  // Recently added already store a fully resolved image URL
                  productsToShow = recentlyAddedProducts.slice(0, 3).map(product => ({
                    image: product?.image,
                  }));
                } else if (cartItems.length > 0) {
                  productsToShow = cartItems.slice(0, 3).map(item => {
                    const product = item?.productId || item?.product;
                    return {
                      image: product?.images?.[0] || 
                             product?.primary_image?.[0] || 
                             product?.image || 
                             item?.image,
                    };
                  });
                }

                return productsToShow.map((product, index) => {
                  const productImage = product?.image as string | undefined;
                  const imageUri = productImage
                    ? (productImage.startsWith("http") ? productImage : ApiService.getImage(productImage))
                    : null;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.cartProductImageContainer,
                        index > 0 && styles.stackedImage,
                        { zIndex: 10 - index },
                      ]}
                    >
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.cartProductImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.cartProductImagePlaceholder} />
                      )}
                    </View>
                  );
                });
              })()}
            </View>

            {/* View Cart Text */}
            <View style={styles.cartTextBlock}>
              <TextView style={styles.cartButtonText}>View Cart</TextView>
            </View>

            <View style={styles.arrowCircle}>
              <Icon name="chevron-forward" family="Ionicons" size={18} color="#fff"  />
            </View>
          </View>
          </LinearGradient>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

export default SubCategoryList;