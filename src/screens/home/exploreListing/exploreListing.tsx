import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  StyleSheet,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Header, TextView } from "../../../components";
import ApiService, { IMAGE_BASE_URL } from "../../../service/apiService";
import { Colors } from "../../../constant";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "../../../constant/dimentions";
import ProductCard from "../dashboard/components/ProductCard/productCard";
import { ProductCardItem } from "../../../@types";

const ExploreListing = () => {
  const route = useRoute();
  const { exploreSectionId, exploreSectionName } = route.params as {
    exploreSectionId: string;
    exploreSectionName?: string;
  };

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sectionName, setSectionName] = useState<string>("");

  // Transform API product → ProductCardItem (same logic as dashboard)
  const transformProductToCard = (product: any): ProductCardItem => {
    const variant = product?.ProductVarient?.[0] || product?.variants?.[0] || {};
    const preferredImages =
      (Array.isArray(variant?.images) && variant.images.length > 0
        ? variant.images
        : null) ||
      (Array.isArray(product?.primary_image) && product.primary_image.length > 0
        ? product.primary_image
        : null) ||
      (Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : []);

    const rawImage = preferredImages?.[0] || '';
    const normalizedImage = rawImage ? rawImage.replace(/\\/g, '/') : '';
    const fullImageUrl = normalizedImage ? IMAGE_BASE_URL + normalizedImage : '';

    const weightValue =
      variant?.weight ??
      product?.weight ??
      variant?.stock ??
      product?.stock ??
      1;
    const unitValue = variant?.unit ?? product?.unit ?? "kg";

    return {
      id: product?._id || '',
      name: product?.productName || product?.name || 'Product',
      image: fullImageUrl,
      price: variant?.price || product?.price || 0,
      oldPrice: variant?.originalPrice || product?.mrp || 0,
      discount: variant?.discount ? `₹${variant.discount} OFF` : '',
      weight: `${weightValue} ${unitValue}`.trim(),
      rating: product?.rating || 4.5,
      options: `${(product?.ProductVarient || product?.variants || []).length} Option${((product?.ProductVarient || product?.variants || []).length || 0) > 1 ? 's' : ''}`,
    };
  };

  const loadExploreProducts = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getExploreSection(exploreSectionId);

      // Handle response structure based on API response
      const exploreData = res.data?.exploreSectionsRaw || res.data?.data || res.data;
      
      if (exploreData?.name) {
        setSectionName(exploreData.name);
      }

      const apiProducts = exploreData?.products || res.data?.products || [];
      
      // Transform products using same logic as dashboard
      const transformedProducts = (Array.isArray(apiProducts) ? apiProducts : []).map(transformProductToCard);
      setProducts(transformedProducts);
    } catch (err) {
      console.log("Explore Products Load Error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExploreProducts();
  }, [exploreSectionId]);

  const displayName = exploreSectionName || sectionName || "Explore Products";

  return (
    <SafeAreaView style={styles.screen}>
      <Header title={displayName} isBack />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.PRIMARY[300]} />
        </View>
      ) : (
        <>
          
          

          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <TextView style={styles.emptyText}>
                No products found
              </TextView>
            </View>
          ) : (
            <View style={styles.gridWrapper}>
              <ProductCard
                cardArray={products.filter((p) =>
                  (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                )}
                type="BOUGHT"
                horizontal={false}
                numOfColumn={2}
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default ExploreListing;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#212121",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
  gridWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
});

