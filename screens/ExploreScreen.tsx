import CategoryGrid from "@/components/CategoryGrid";
import CompactFoodCard from "@/components/CompactFoodCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    CategoryItem,
    ExploreResult,
    MEAL_CATEGORIES,
    MOOD_CATEGORIES,
    OCCASION_CATEGORIES,
    searchByCategory,
    searchByKeyword,
} from "@/services/exploreService";
import { getCurrentLocation } from "@/utils/geoUtils";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Skeleton Loader
// ========================
interface SkeletonLoaderProps {
  theme: typeof Colors.light;
}

const SkeletonCard = ({ theme }: { theme: typeof Colors.light }) => (
  <View style={[styles.skeletonCard, { backgroundColor: theme.surfaceSecondary }]}>
    <View style={[styles.skeletonImage, { backgroundColor: theme.border }]} />
    <View style={styles.skeletonContent}>
      <View style={[styles.skeletonText, { width: "70%", backgroundColor: theme.border }]} />
      <View style={[styles.skeletonText, { width: "50%", backgroundColor: theme.border }]} />
      <View style={[styles.skeletonText, { width: "90%", marginTop: 8, backgroundColor: theme.border }]} />
    </View>
  </View>
);

const SkeletonLoader = ({ theme }: SkeletonLoaderProps) => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3, 4, 5].map((i) => (
      <SkeletonCard key={i} theme={theme} />
    ))}
  </View>
);

// ========================
// Main Screen
// ========================
export default function ExploreScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState(params.q || "");
  const [results, setResults] = useState<ExploreResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(
    null,
  );
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      const coords = await getCurrentLocation();
      if (coords) {
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
      } else {
        // Default to HCMC center
        setUserCoords({ lat: 10.7769, lng: 106.7009 });
      }
    };
    getLocation();
  }, []);

  // Auto search if query param is provided
  useEffect(() => {
    if (params.q && userCoords) {
      setSearchQuery(params.q);
      handleSearch(params.q);
    }
  }, [params.q, userCoords]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim();
    if (!searchTerm || !userCoords) return;

    Keyboard.dismiss();
    setIsLoading(true);
    setHasSearched(true);
    setSelectedCategory(null);

    try {
      const data = await searchByKeyword(
        searchTerm,
        userCoords.lat,
        userCoords.lng,
      );
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = async (category: CategoryItem) => {
    if (!userCoords) return;

    Keyboard.dismiss();
    setSearchQuery("");
    setSelectedCategory(category);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await searchByCategory(
        category,
        userCoords.lat,
        userCoords.lng,
      );
      setResults(data);
    } catch (error) {
      console.error("Category search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    setSelectedCategory(null);
  };

  const renderResultItem = ({ item }: { item: ExploreResult }) => (
    <CompactFoodCard item={item} />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Khám phá
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Tìm món ngon quanh bạn 🍜</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Bạn thèm món gì? (Bún bò, trà sữa...)"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearBtn}
            >
              <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: theme.tint }]}
          onPress={() => handleSearch()}
        >
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader theme={theme} />
      ) : hasSearched ? (
        // Results View
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>
              {selectedCategory
                ? `📂 ${selectedCategory.name}`
                : `🔍 Kết quả cho "${searchQuery}"`}
            </Text>
            <TouchableOpacity onPress={handleClearSearch}>
              <Text style={[styles.clearLink, { color: theme.tint }]}>Xóa</Text>
            </TouchableOpacity>
          </View>

          {results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={[styles.emptyText, { color: theme.text }]}>Không tìm thấy kết quả</Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Thử từ khóa khác hoặc chọn danh mục bên dưới
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: theme.tint }]}
                onPress={handleClearSearch}
              >
                <Text style={styles.retryBtnText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // Categories View
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          <CategoryGrid
            title="🍽️ Theo bữa ăn"
            categories={MEAL_CATEGORIES}
            onCategoryPress={handleCategoryPress}
            theme={theme}
          />
          <CategoryGrid
            title="😊 Theo tâm trạng"
            categories={MOOD_CATEGORIES}
            onCategoryPress={handleCategoryPress}
            theme={theme}
          />
          <CategoryGrid
            title="🎉 Theo dịp"
            categories={OCCASION_CATEGORIES}
            onCategoryPress={handleCategoryPress}
            theme={theme}
          />

          {/* Tips */}
          <View style={[styles.tipsContainer, { backgroundColor: colorScheme === 'dark' ? '#3D3200' : '#FFF8E1' }]}>
            <Text style={[styles.tipsTitle, { color: colorScheme === 'dark' ? '#FFB300' : '#F57C00' }]}>💡 Mẹo tìm kiếm</Text>
            <Text style={[styles.tipsText, { color: colorScheme === 'dark' ? '#FFD54F' : '#5D4037' }]}>
              • Gõ tên món: "Phở", "Bún chả", "Trà sữa"{"\n"}• Gõ tên quán:
              "Phúc Long", "Highlands"{"\n"}• Hoặc chọn danh mục phía trên để
              khám phá!
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ========================
// Styles
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  // Search
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
  },
  searchBtn: {
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: "center",
  },
  searchBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
  // Categories
  categoriesScroll: {
    flex: 1,
  },
  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  clearLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryBtnText: {
    color: "#FFF",
    fontWeight: "600",
  },
  // Skeleton
  skeletonContainer: {
    paddingHorizontal: 20,
  },
  skeletonCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  skeletonText: {
    height: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  // Tips
  tipsContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB300",
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
