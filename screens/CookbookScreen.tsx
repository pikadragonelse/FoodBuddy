import {
  EmptyState,
  Header,
  RecipeCard,
  SearchBar,
  SectionTitle,
  SkeletonList,
} from "@/components/cookbook";
import { POPULAR_RECIPES } from "@/constants/recipes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getUnsplashImage } from "@/services/imageService";
import { getRecipeSearchResults } from "@/services/recipeSearchCache";
import { cookbookStyles as styles } from "@/styles/cookbookStyles";
import type { RecipePreview } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Main Screen
// ========================
export default function CookbookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; searchKeyword?: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState(
    params.q || params.searchKeyword || ""
  );
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // ========================
  // Data Loading
  // ========================
  const loadPopularRecipes = async () => {
    setIsLoading(true);
    try {
      const recipesWithImages = await Promise.all(
        POPULAR_RECIPES.map(async (recipe) => {
          const imageUrl = await getUnsplashImage(recipe.englishName);
          return { ...recipe, imageUrl };
        })
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
      const results = await getRecipeSearchResults(searchTerm, {
        onSourceChange: (source) => {
          console.log(`📊 [UI] Search source: ${source}`);
        },
      });
      setRecipes(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // ========================
  // Effects
  // ========================
  useEffect(() => {
    loadPopularRecipes();
  }, []);

  useEffect(() => {
    const keyword = params.q || params.searchKeyword;
    if (keyword) {
      console.log(`🔍 [Cookbook] Auto-search from params: ${keyword}`);
      setSearchQuery(keyword);
      handleSearch(keyword);
    }
  }, [params.q, params.searchKeyword]);

  // ========================
  // Handlers
  // ========================
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

  // ========================
  // Render
  // ========================
  const renderRecipe = ({ item }: { item: RecipePreview }) => (
    <RecipeCard
      recipe={item}
      onPress={() => handleRecipePress(item)}
      theme={theme}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <Header theme={theme} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={() => handleSearch()}
        onClear={handleClear}
        theme={theme}
      />

      {/* Section Title */}
      <SectionTitle searchQuery={searchQuery} theme={theme} />

      {/* Recipe List */}
      {isLoading || isSearching ? (
        <SkeletonList theme={theme} />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={<EmptyState theme={theme} />}
        />
      )}
    </SafeAreaView>
  );
}
