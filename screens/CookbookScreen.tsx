import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getUnsplashImage } from "@/services/imageService";
import {
  getRecipeSearchResults,
  type RecipePreview,
} from "@/services/recipeSearchCache";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Popular Recipes (Default) - Type từ recipeSearchCache
// ========================

// ========================
// Popular Recipes (Default)
// ========================
const POPULAR_RECIPES: Omit<RecipePreview, "imageUrl">[] = [
  {
    id: "1",
    dishName: "Phở Bò",
    englishName: "Vietnamese Beef Pho",
    description: "Món quốc hồn quốc túy Việt Nam",
    difficulty: "Trung bình",
    cookTime: "3 giờ",
  },
  {
    id: "2",
    dishName: "Bún Chả",
    englishName: "Vietnamese Grilled Pork",
    description: "Đặc sản Hà Nội với thịt nướng thơm lừng",
    difficulty: "Dễ",
    cookTime: "45 phút",
  },
  {
    id: "3",
    dishName: "Cơm Tấm",
    englishName: "Broken Rice",
    description: "Bữa sáng đậm đà miền Nam",
    difficulty: "Dễ",
    cookTime: "30 phút",
  },
  {
    id: "4",
    dishName: "Bánh Mì",
    englishName: "Vietnamese Sandwich",
    description: "Street food nổi tiếng thế giới",
    difficulty: "Dễ",
    cookTime: "20 phút",
  },
  {
    id: "5",
    dishName: "Gỏi Cuốn",
    englishName: "Fresh Spring Rolls",
    description: "Món khai vị thanh mát, healthy",
    difficulty: "Dễ",
    cookTime: "25 phút",
  },
  {
    id: "6",
    dishName: "Bún Bò Huế",
    englishName: "Hue Beef Noodle",
    description: "Cay nồng đậm đà xứ Huế",
    difficulty: "Khó",
    cookTime: "4 giờ",
  },
];

// ========================
// Recipe Card Component
// ========================
interface RecipeCardProps {
  recipe: RecipePreview;
  onPress: () => void;
  theme: typeof Colors.light;
}

const RecipeCard = ({ recipe, onPress, theme }: RecipeCardProps) => (
  <TouchableOpacity
    style={[styles.recipeCard, { backgroundColor: theme.surfaceSecondary }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Image
      source={{ uri: recipe.imageUrl }}
      style={[styles.recipeImage, { backgroundColor: theme.border }]}
      resizeMode="cover"
    />
    <View style={styles.recipeInfo}>
      <Text style={[styles.recipeName, { color: theme.text }]}>{recipe.dishName}</Text>
      <Text style={[styles.recipeDesc, { color: theme.textSecondary }]} numberOfLines={2}>
        {recipe.description}
      </Text>
      <View style={styles.recipeMeta}>
        <View style={styles.metaTag}>
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>{recipe.cookTime}</Text>
        </View>
        <View style={styles.metaTag}>
          <Text style={styles.metaIcon}>📊</Text>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>{recipe.difficulty}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// ========================
// Skeleton Loader
// ========================
interface SkeletonCardProps {
  theme: typeof Colors.light;
}

const SkeletonCard = ({ theme }: SkeletonCardProps) => (
  <View style={[styles.skeletonCard, { backgroundColor: theme.surfaceSecondary }]}>
    <View style={[styles.skeletonImage, { backgroundColor: theme.border }]} />
    <View style={styles.skeletonInfo}>
      <View style={[styles.skeletonText, { width: "70%", backgroundColor: theme.border }]} />
      <View style={[styles.skeletonText, { width: "90%", backgroundColor: theme.border }]} />
      <View style={[styles.skeletonText, { width: "50%", backgroundColor: theme.border }]} />
    </View>
  </View>
);

// ========================
// Main Screen
// ========================
export default function CookbookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState(params.q || "");
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Load popular recipes on mount
  useEffect(() => {
    loadPopularRecipes();
  }, []);

  // Auto search if query param
  useEffect(() => {
    if (params.q) {
      setSearchQuery(params.q);
      handleSearch(params.q);
    }
  }, [params.q]);

  const loadPopularRecipes = async () => {
    setIsLoading(true);
    try {
      const recipesWithImages = await Promise.all(
        POPULAR_RECIPES.map(async (recipe) => {
          const imageUrl = await getUnsplashImage(recipe.englishName);
          return { ...recipe, imageUrl };
        }),
      );
      setRecipes(recipesWithImages);
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim();
    if (!searchTerm) {
      loadPopularRecipes();
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);

    try {
      // Sử dụng Cache-First Strategy
      const results = await getRecipeSearchResults(searchTerm, {
        onSourceChange: (source) => {
          console.log(`📊 [UI] Search source: ${source}`);
          // Nếu cache hit, loading sẽ rất nhanh
          // Nếu API, loading sẽ lâu hơn
        },
      });

      setRecipes(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecipePress = (recipe: RecipePreview) => {
    router.push({
      pathname: "/cookbook/[dishName]" as any,
      params: { dishName: recipe.dishName },
    });
  };

  const handleClear = () => {
    setSearchQuery("");
    loadPopularRecipes();
  };

  const renderRecipe = ({ item }: { item: RecipePreview }) => (
    <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} theme={theme} />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Công thức nấu ăn
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Học nấu món ngon mỗi ngày 👨‍🍳</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Tìm công thức (Phở, Bún bò, Bánh...)"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
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

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {searchQuery
            ? `🔍 Kết quả cho "${searchQuery}"`
            : "🔥 Công thức phổ biến"}
        </Text>
      </View>

      {/* Recipe List */}
      {isLoading || isSearching ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} theme={theme} />
          ))}
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Không tìm thấy công thức</Text>
            </View>
          }
        />
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
    marginBottom: 16,
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
  // Section
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
  // Recipe Card
  recipeCard: {
    width: "48%",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: {
    width: "100%",
    height: 120,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    fontSize: 11,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Skeleton
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  skeletonCard: {
    width: "48%",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  skeletonImage: {
    width: "100%",
    height: 120,
  },
  skeletonInfo: {
    padding: 12,
  },
  skeletonText: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  // Empty
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
