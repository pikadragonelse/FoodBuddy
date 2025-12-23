import { Colors } from "@/constants/theme";
import { cookbookStyles as styles } from "@/styles/cookbookStyles";
import type { RecipePreview } from "@/types";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

// ========================
// Recipe Card Component
// ========================
interface RecipeCardProps {
  recipe: RecipePreview;
  onPress: () => void;
  theme: typeof Colors.light;
}

export const RecipeCard = ({ recipe, onPress, theme }: RecipeCardProps) => (
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
      <Text style={[styles.recipeName, { color: theme.text }]}>
        {recipe.dishName}
      </Text>
      <Text
        style={[styles.recipeDesc, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {recipe.description}
      </Text>
      <View style={styles.recipeMeta}>
        <View style={styles.metaTag}>
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {recipe.cookTime}
          </Text>
        </View>
        <View style={styles.metaTag}>
          <Text style={styles.metaIcon}>📊</Text>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {recipe.difficulty}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// ========================
// Skeleton Card Component
// ========================
interface SkeletonCardProps {
  theme: typeof Colors.light;
}

export const SkeletonCard = ({ theme }: SkeletonCardProps) => (
  <View
    style={[styles.skeletonCard, { backgroundColor: theme.surfaceSecondary }]}
  >
    <View style={[styles.skeletonImage, { backgroundColor: theme.border }]} />
    <View style={styles.skeletonInfo}>
      <View
        style={[
          styles.skeletonText,
          { width: "70%", backgroundColor: theme.border },
        ]}
      />
      <View
        style={[
          styles.skeletonText,
          { width: "90%", backgroundColor: theme.border },
        ]}
      />
      <View
        style={[
          styles.skeletonText,
          { width: "50%", backgroundColor: theme.border },
        ]}
      />
    </View>
  </View>
);

// ========================
// Search Bar Component
// ========================
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  onClear: () => void;
  theme: typeof Colors.light;
}

export const SearchBar = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  theme,
}: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <View
      style={[
        styles.searchInputWrapper,
        { backgroundColor: theme.surfaceSecondary },
      ]}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder="Tìm công thức (Phở, Bún bò, Bánh...)"
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </View>
    <TouchableOpacity
      style={[styles.searchBtn, { backgroundColor: theme.tint }]}
      onPress={onSearch}
    >
      <Text style={styles.searchBtnText}>Tìm</Text>
    </TouchableOpacity>
  </View>
);

// ========================
// Header Component
// ========================
interface HeaderProps {
  theme: typeof Colors.light;
}

export const Header = ({ theme }: HeaderProps) => (
  <View style={styles.header}>
    <Text style={[styles.headerTitle, { color: theme.text }]}>
      Công thức nấu ăn
    </Text>
    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
      Học nấu món ngon mỗi ngày 👨‍🍳
    </Text>
  </View>
);

// ========================
// Section Title Component
// ========================
interface SectionTitleProps {
  searchQuery: string;
  theme: typeof Colors.light;
}

export const SectionTitle = ({ searchQuery, theme }: SectionTitleProps) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: theme.text }]}>
      {searchQuery
        ? `🔍 Kết quả cho "${searchQuery}"`
        : "🔥 Công thức phổ biến"}
    </Text>
  </View>
);

// ========================
// Empty State Component
// ========================
interface EmptyStateProps {
  theme: typeof Colors.light;
}

export const EmptyState = ({ theme }: EmptyStateProps) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>📖</Text>
    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
      Không tìm thấy công thức
    </Text>
  </View>
);

// ========================
// Skeleton List Component
// ========================
interface SkeletonListProps {
  theme: typeof Colors.light;
  count?: number;
}

export const SkeletonList = ({ theme, count = 4 }: SkeletonListProps) => (
  <View style={styles.skeletonContainer}>
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} theme={theme} />
    ))}
  </View>
);
