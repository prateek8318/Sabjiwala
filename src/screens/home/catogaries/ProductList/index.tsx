import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Dimensions,
} from "react-native";
import { Header, TextView } from "../../../../components";
import ApiService from "../../../../service/apiService";
import { Colors } from "../../../../constant";
import LinearGradient from "react-native-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "../../../../constant/dimentions";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2; // Left menu ke liye perfect size

const ProductList = ({ route, navigation }: any) => {
  const { subCategoryId, subCategoryName } = route.params;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // FIXED — SAME EXACT ONE FROM CATEGORY SCREEN
  const buildImageUrl = (rawPath?: string) => {
    if (!rawPath) return null;

    if (rawPath.startsWith("http")) return rawPath;

    const cleaned = rawPath
      .replace(/\\/g, "/")
      .replace(/^\//, "");

    const finalUrl = ApiService.getImage(cleaned);
    console.log("ProductList Image → raw:", rawPath, "| cleaned:", cleaned, "| final:", finalUrl);
    return finalUrl;
  };

  const loadProducts = async () => {
    try {
      const res = await ApiService.getSubCategoryProducts(subCategoryId);

      const apiData =
        res.data?.paginateData ||
        res.data?.products ||
        res.data?.productData ||
        res.data?.data ||
        res.data?.items ||
        [];

      setProducts(Array.isArray(apiData) ? apiData : []);
    } catch (err) {
      console.log("Product Load Error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const renderItem = ({ item }: any) => {
    // 🔥 FINAL FIXED IMAGE FETCH ORDER (same as your working categories screen)
    const rawImage =
      item?.primary_image ||
      item?.primaryImage ||
      item?.thumbnail ||
      item?.images?.[0] ||
      item?.ProductVarient?.[0]?.images?.[0] ||
      item?.variants?.[0]?.images?.[0] ||
      item?.image;

    const img =
      (rawImage && buildImageUrl(rawImage)) ||
      "https://via.placeholder.com/300x150.png?text=No+Image";

    const price =
      item?.variants?.[0]?.price ??
      item?.ProductVarient?.[0]?.price ??
      item?.price ??
      "0";

    const variantCount =
      (item?.variants?.length || 0) + (item?.ProductVarient?.length || 0);
    const hasVariants = variantCount > 0;
    const optionLabel =
      variantCount > 1
        ? `${variantCount} Options`
        : variantCount === 1
        ? "1 Option"
        : "Options";

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item._id })
        }
        style={{
          width: CARD_WIDTH,
          backgroundColor: "#fff",
          borderRadius: 12,
          elevation: 2,
          marginVertical: 10,
          padding: 10,
        }}
      >
        <Image
          source={{ uri: img }}
          style={{ width: "100%", height: 130, borderRadius: 8 }}
          resizeMode="cover"
        />

        <TextView
          style={{ fontSize: 15, fontWeight: "600", marginTop: 8 }}
          numberOfLines={1}
        >
          {item.name}
        </TextView>

        <TextView style={{ marginTop: 4, color: Colors.PRIMARY[300] }}>
          ₹ {price}
        </TextView>

        {/* Action buttons similar to dashboard cardMainView */}
        <View style={{ marginTop: 10, alignItems: "flex-end" }}>
          {hasVariants ? (
            <View>
              {/* Upper half-width Add (same width as option) */}
              <Pressable
                onPress={() =>
                  navigation.navigate("ProductDetail", { productId: item._id })
                }
              >
                <LinearGradient
                  colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                  style={{
                    width: 75,
                    height: 20,
                    borderTopLeftRadius: 45,
                    borderTopRightRadius: 45,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TextView
                    style={{
                      color: Colors.PRIMARY[300],
                      fontSize: 14,
                      textAlign: "center",
                      includeFontPadding: false,
                    }}
                  >
                    Add
                  </TextView>
                </LinearGradient>
              </Pressable>

              {/* Option strip */}
              <Pressable
                onPress={() =>
                  navigation.navigate("ProductDetail", { productId: item._id })
                }
                style={{
                  width: 75,
                  height: 17,
                  backgroundColor: Colors.PRIMARY[600],
                  borderBottomLeftRadius: 45,
                  borderBottomRightRadius: 45,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TextView
                  style={{
                    color: Colors.PRIMARY[400],
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {optionLabel}
                </TextView>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item._id })
              }
            >
              <LinearGradient
                colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
                style={{
                  height: hp(3.5),
                  width: wp(15),
                  marginTop: -10,
                  borderRadius: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0 }}
              >
                <TextView
                  style={{
                    color: Colors.PRIMARY[300],
                    fontSize: 14,
                    textAlign: "center",
                    includeFontPadding: false,
                  }}
                >
                  Add
                </TextView>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title={subCategoryName || "Products"} isBack />

      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY[300]} />
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 16,
              marginTop: 12,
              backgroundColor: "#F5F5F5",
              borderRadius: 12,
              paddingHorizontal: 10,
              height: 40,
            }}
          >
            <TextInput
              style={{ flex: 1, fontSize: 14, color: "#212121" }}
              placeholder="Search in products"
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={products.filter((p) =>
              (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
            )}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{
              paddingHorizontal: 8,
              justifyContent: "space-between",
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default ProductList;
