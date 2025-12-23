import { Colors } from "@/constants/theme";
import { CategoryItem } from "@/services/exploreService";
import { exploreStyles as styles } from "@/styles/exploreStyles";
import React from "react";
import {
    Animated,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ========================
// Selected Tags Bar
// ========================
interface SelectedTagsBarProps {
  selectedCategories: CategoryItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onSearch: () => void;
  isSearching: boolean;
  theme: typeof Colors.light;
}

export const SelectedTagsBar = ({
  selectedCategories,
  onRemove,
  onClear,
  onSearch,
  isSearching,
  theme,
}: SelectedTagsBarProps) => {
  if (selectedCategories.length === 0) return null;

  return (
    <Animated.View
      style={[styles.selectedBar, { backgroundColor: theme.surfaceSecondary }]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectedTagsScroll}
      >
        {selectedCategories.map((cat) => (
          <View
            key={cat.id}
            style={[styles.selectedTag, { backgroundColor: cat.color }]}
          >
            <Text style={styles.selectedTagIcon}>{cat.icon}</Text>
            <Text style={styles.selectedTagText}>{cat.name}</Text>
            <TouchableOpacity
              onPress={() => onRemove(cat.id)}
              style={styles.removeTagBtn}
            >
              <Text style={styles.removeTagText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.selectedBarActions}>
        <TouchableOpacity onPress={onClear} style={styles.clearAllBtn}>
          <Text style={[styles.clearAllText, { color: theme.textSecondary }]}>
            Xóa
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchSelectedBtn, { backgroundColor: theme.tint }]}
          onPress={onSearch}
          disabled={isSearching}
        >
          <Text style={styles.searchSelectedText}>
            {isSearching ? "..." : `Tìm (${selectedCategories.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ========================
// Hero Section
// ========================
interface HeroSectionProps {
  theme: typeof Colors.light;
  colorScheme: string;
}

export const HeroSection = ({ theme, colorScheme }: HeroSectionProps) => (
  <View
    style={[
      styles.heroSection,
      {
        backgroundColor:
          colorScheme === "dark"
            ? "rgba(255,107,0,0.15)"
            : "rgba(255,107,0,0.08)",
      },
    ]}
  >
    <Text style={styles.heroEmoji}>🍜</Text>
    <View style={styles.heroContent}>
      <Text style={[styles.heroTitle, { color: theme.text }]}>
        Hôm nay ăn gì?
      </Text>
      <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
        Chọn nhiều tags để tìm món phù hợp nhất
      </Text>
    </View>
  </View>
);

// ========================
// Skeleton Loader
// ========================
interface SkeletonProps {
  theme: typeof Colors.light;
}

const SkeletonCard = ({ theme }: SkeletonProps) => (
  <View
    style={[styles.skeletonCard, { backgroundColor: theme.surfaceSecondary }]}
  >
    <View style={[styles.skeletonImage, { backgroundColor: theme.border }]} />
    <View style={styles.skeletonContent}>
      <View
        style={[
          styles.skeletonText,
          { width: "70%", backgroundColor: theme.border },
        ]}
      />
      <View
        style={[
          styles.skeletonText,
          { width: "50%", backgroundColor: theme.border },
        ]}
      />
      <View
        style={[
          styles.skeletonText,
          { width: "90%", marginTop: 8, backgroundColor: theme.border },
        ]}
      />
    </View>
  </View>
);

export const SkeletonLoader = ({ theme }: SkeletonProps) => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3, 4, 5].map((i) => (
      <SkeletonCard key={i} theme={theme} />
    ))}
  </View>
);
