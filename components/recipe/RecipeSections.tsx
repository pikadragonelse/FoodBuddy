import { DEFAULT_FOOD_IMAGE } from "@/constants/recipes";
import { Colors } from "@/constants/theme";
import { recipeDetailStyles as styles } from "@/styles/recipeDetailStyles";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Hero Image Section
// ========================
interface HeroImageProps {
  imageUrl?: string;
  isSaved: boolean;
  onGoBack: () => void;
  onSaveToggle: () => void;
}

export const HeroImage = ({
  imageUrl,
  isSaved,
  onGoBack,
  onSaveToggle,
}: HeroImageProps) => (
  <View style={styles.imageContainer}>
    <Image
      source={{ uri: imageUrl || DEFAULT_FOOD_IMAGE }}
      style={styles.heroImage}
      resizeMode="cover"
    />
    <View style={styles.imageOverlay} />

    {/* Floating Buttons */}
    <SafeAreaView style={styles.floatingButtons} edges={["top"]}>
      <TouchableOpacity style={styles.floatingBtn} onPress={onGoBack}>
        <Text style={styles.floatingBtnText}>←</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.floatingBtn} onPress={onSaveToggle}>
        <Text style={styles.floatingBtnText}>{isSaved ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  </View>
);

// ========================
// Progress Section
// ========================
interface ProgressSectionProps {
  completedSteps: number;
  totalSteps: number;
  progress: number;
  theme: typeof Colors.light;
  colorScheme: string;
}

export const ProgressSection = ({
  completedSteps,
  totalSteps,
  progress,
  theme,
  colorScheme,
}: ProgressSectionProps) => (
  <View
    style={[
      styles.progressSection,
      { backgroundColor: colorScheme === "dark" ? "#3D2800" : "#FFF3E0" },
    ]}
  >
    <Text style={[styles.progressText, { color: theme.tint }]}>
      📊 Tiến độ: {completedSteps}/{totalSteps} bước ({Math.round(progress * 100)}
      %)
    </Text>
  </View>
);

// ========================
// Section Title
// ========================
interface SectionTitleProps {
  icon: string;
  title: string;
  theme: typeof Colors.light;
}

export const SectionTitle = ({ icon, title, theme }: SectionTitleProps) => (
  <Text style={[styles.sectionTitle, { color: theme.text }]}>
    {icon} {title}
  </Text>
);

// ========================
// Cooking Mode Hint
// ========================
interface CookingModeHintProps {
  theme: typeof Colors.light;
  colorScheme: string;
}

export const CookingModeHint = ({ theme, colorScheme }: CookingModeHintProps) => (
  <Text
    style={[
      styles.cookingModeHint,
      {
        color: theme.tint,
        backgroundColor: colorScheme === "dark" ? "#3D2800" : "#FFF3E0",
      },
    ]}
  >
    🔥 Chế độ nấu ăn: Màn hình sẽ không tắt
  </Text>
);

// ========================
// Ingredient Hint
// ========================
interface IngredientHintProps {
  theme: typeof Colors.light;
}

export const IngredientHint = ({ theme }: IngredientHintProps) => (
  <Text style={[styles.ingredientHint, { color: theme.textSecondary }]}>
    💡 Bấm vào nguyên liệu để đánh dấu đã chuẩn bị
  </Text>
);
