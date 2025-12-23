import CompactFoodCard from "@/components/CompactFoodCard";
import {
  HeroSection,
  SelectedTagsBar,
  SkeletonLoader,
  TagSection,
} from "@/components/explore";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  BUDGET_CATEGORIES,
  CategoryItem,
  ExploreResult,
  MEAL_CATEGORIES,
  MOOD_CATEGORIES,
  OCCASION_CATEGORIES,
  searchByCategory,
  searchByKeyword,
} from "@/services/exploreService";
import { exploreStyles as styles } from "@/styles/exploreStyles";
import { getCurrentLocation } from "@/utils/geoUtils";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get all categories
  const ALL_CATEGORIES = [
    ...MEAL_CATEGORIES,
    ...MOOD_CATEGORIES,
    ...OCCASION_CATEGORIES,
    ...BUDGET_CATEGORIES,
  ];

  // Get selected category objects
  const selectedCategories = ALL_CATEGORIES.filter((cat) =>
    selectedTags.has(cat.id)
  );

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
    setSelectedTags(new Set());

    try {
      const data = await searchByKeyword(
        searchTerm,
        userCoords.lat,
        userCoords.lng
      );
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagPress = (category: CategoryItem) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category.id)) {
        newSet.delete(category.id);
      } else {
        newSet.add(category.id);
      }
      return newSet;
    });
  };

  const handleRemoveTag = (id: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleClearTags = () => {
    setSelectedTags(new Set());
  };

  const handleSearchByTags = async () => {
    if (!userCoords || selectedCategories.length === 0) return;

    Keyboard.dismiss();
    setSearchQuery("");
    setIsLoading(true);
    setHasSearched(true);

    try {
      // Combine prompts from all selected categories
      const combinedPrompt = selectedCategories
        .map((cat) => cat.prompt)
        .join(", ");

      // Create a virtual category with combined prompt
      const virtualCategory: CategoryItem = {
        id: "multi-select",
        name: selectedCategories.map((c) => c.name).join(" + "),
        icon: selectedCategories[0].icon,
        prompt: combinedPrompt,
        color: selectedCategories[0].color,
      };

      console.log(
        `🏷️ [Multi-Tag Search] ${virtualCategory.name}: ${combinedPrompt}`
      );

      const data = await searchByCategory(
        virtualCategory,
        userCoords.lat,
        userCoords.lng
      );
      setResults(data);
    } catch (error) {
      console.error("Tag search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    setSelectedTags(new Set());
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
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Tìm món ngon quanh bạn 📍
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputWrapper,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor:
                colorScheme === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              borderWidth: 1,
            },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Phở, Bún bò, Trà sữa..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>
                ✕
              </Text>
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

      {/* Selected Tags Bar */}
      <SelectedTagsBar
        selectedCategories={selectedCategories}
        onRemove={handleRemoveTag}
        onClear={handleClearTags}
        onSearch={handleSearchByTags}
        isSearching={isLoading}
        theme={theme}
      />

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader theme={theme} />
      ) : hasSearched ? (
        <ResultsView
          results={results}
          selectedCategories={selectedCategories}
          searchQuery={searchQuery}
          onClear={handleClearSearch}
          theme={theme}
          renderItem={renderResultItem}
        />
      ) : (
        <CategoriesView
          selectedTags={selectedTags}
          onTagPress={handleTagPress}
          theme={theme}
          colorScheme={colorScheme}
        />
      )}
    </SafeAreaView>
  );
}

// ========================
// Results View
// ========================
interface ResultsViewProps {
  results: ExploreResult[];
  selectedCategories: CategoryItem[];
  searchQuery: string;
  onClear: () => void;
  theme: typeof Colors.light;
  renderItem: ({ item }: { item: ExploreResult }) => React.JSX.Element;
}

const ResultsView = ({
  results,
  selectedCategories,
  searchQuery,
  onClear,
  theme,
  renderItem,
}: ResultsViewProps) => (
  <View style={styles.resultsContainer}>
    <View style={styles.resultsHeader}>
      <Text style={[styles.resultsTitle, { color: theme.text }]}>
        {selectedCategories.length > 0
          ? `🏷️ ${selectedCategories.map((c) => c.name).join(" + ")}`
          : `🔍 "${searchQuery}"`}
      </Text>
      <TouchableOpacity onPress={onClear}>
        <Text style={[styles.clearLink, { color: theme.tint }]}>← Quay lại</Text>
      </TouchableOpacity>
    </View>

    {results.length > 0 ? (
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    ) : (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🍽️</Text>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          Không tìm thấy kết quả
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          Thử từ khóa khác hoặc chọn tags khác nhé!
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.tint }]}
          onPress={onClear}
        >
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

// ========================
// Categories View
// ========================
interface CategoriesViewProps {
  selectedTags: Set<string>;
  onTagPress: (category: CategoryItem) => void;
  theme: typeof Colors.light;
  colorScheme: string;
}

const CategoriesView = ({
  selectedTags,
  onTagPress,
  theme,
  colorScheme,
}: CategoriesViewProps) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    style={styles.categoriesScroll}
    contentContainerStyle={styles.categoriesContent}
  >
    {/* Hero */}
    <HeroSection theme={theme} colorScheme={colorScheme} />

    {/* Tag Sections */}
    <TagSection
      title="🍽️ Theo bữa ăn"
      subtitle="Chạm để chọn"
      categories={MEAL_CATEGORIES}
      selectedTags={selectedTags}
      onTagPress={onTagPress}
      theme={theme}
      colorScheme={colorScheme}
    />

    <TagSection
      title="😊 Theo tâm trạng"
      subtitle="Bạn đang cảm thấy..."
      categories={MOOD_CATEGORIES}
      selectedTags={selectedTags}
      onTagPress={onTagPress}
      theme={theme}
      colorScheme={colorScheme}
    />

    <TagSection
      title="🎉 Theo dịp"
      subtitle="Ăn cùng ai?"
      categories={OCCASION_CATEGORIES}
      selectedTags={selectedTags}
      onTagPress={onTagPress}
      theme={theme}
      colorScheme={colorScheme}
    />

    <TagSection
      title="💰 Theo chi phí"
      subtitle="Ngân sách hôm nay?"
      categories={BUDGET_CATEGORIES}
      selectedTags={selectedTags}
      onTagPress={onTagPress}
      theme={theme}
      colorScheme={colorScheme}
    />

    {/* Tips */}
    <View
      style={[
        styles.tipsContainer,
        {
          backgroundColor:
            colorScheme === "dark"
              ? "rgba(255,179,0,0.1)"
              : "rgba(255,179,0,0.08)",
          borderColor:
            colorScheme === "dark"
              ? "rgba(255,179,0,0.3)"
              : "rgba(255,179,0,0.2)",
        },
      ]}
    >
      <Text style={[styles.tipsTitle, { color: theme.tint }]}>💡 Mẹo hay</Text>
      <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
        Chọn nhiều tags để AI tìm món phù hợp nhất với bạn!{"\n"}
        Ví dụ: "Bữa sáng" + "Một mình" = Phở nóng, Xôi, Bánh mì...
      </Text>
    </View>

    <View style={{ height: 100 }} />
  </ScrollView>
);
