import { Colors } from "@/constants/theme";
import { IngredientItem, RecipeDetails } from "@/services/recipeService";
import { recipeDetailStyles as styles } from "@/styles/recipeDetailStyles";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

// ========================
// Skeleton Loading Component
// ========================
export const SkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    <View style={[styles.skeletonImage, styles.shimmer]} />
    <View style={styles.skeletonBody}>
      <View style={[styles.skeletonTitle, styles.shimmer]} />
      <View style={[styles.skeletonDescription, styles.shimmer]} />
      <View style={styles.skeletonMetaRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.skeletonMetaItem, styles.shimmer]} />
        ))}
      </View>
      <View style={[styles.skeletonSection, styles.shimmer]} />
      <View style={[styles.skeletonSection, styles.shimmer]} />
    </View>
  </View>
);

// ========================
// Error State Component
// ========================
interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onGoBack: () => void;
  theme: typeof Colors.light;
}

export const ErrorState = ({ error, onRetry, onGoBack, theme }: ErrorStateProps) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorEmoji}>😔</Text>
    <Text style={[styles.errorText, { color: theme.textSecondary }]}>
      {error || "Đã có lỗi xảy ra"}
    </Text>
    <TouchableOpacity
      style={[styles.retryButton, { backgroundColor: theme.tint }]}
      onPress={onRetry}
    >
      <Text style={styles.retryButtonText}>🔄 Thử lại</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.backLink} onPress={onGoBack}>
      <Text style={[styles.backLinkText, { color: theme.tint }]}>← Quay lại</Text>
    </TouchableOpacity>
  </View>
);

// ========================
// Ingredient Row Component
// ========================
interface IngredientRowProps {
  ingredient: IngredientItem;
  isChecked: boolean;
  onToggle: () => void;
  theme: typeof Colors.light;
}

export const IngredientRow = ({
  ingredient,
  isChecked,
  onToggle,
  theme,
}: IngredientRowProps) => (
  <TouchableOpacity
    style={[styles.ingredientRow, { borderBottomColor: theme.border }]}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View
      style={[
        styles.ingredientCheckbox,
        isChecked && styles.ingredientCheckboxChecked,
      ]}
    >
      {isChecked && <Text style={styles.ingredientCheckmark}>✓</Text>}
    </View>
    <View style={styles.ingredientInfo}>
      <Text
        style={[
          styles.ingredientName,
          { color: theme.text },
          isChecked && styles.ingredientChecked,
        ]}
      >
        {ingredient.item}
      </Text>
      <Text style={[styles.ingredientAmount, { color: theme.textSecondary }]}>
        {ingredient.amount} {ingredient.note ? `• ${ingredient.note}` : ""}
      </Text>
    </View>
  </TouchableOpacity>
);

// ========================
// Completion Modal Component
// ========================
interface CompletionModalProps {
  visible: boolean;
  dishName: string;
  onClose: () => void;
  theme: typeof Colors.light;
}

export const CompletionModal = ({
  visible,
  dishName,
  onClose,
  theme,
}: CompletionModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
        <Text style={styles.modalEmoji}>🎊</Text>
        <Text style={[styles.modalTitle, { color: theme.text }]}>Chúc mừng!</Text>
        <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
          Bạn đã nấu xong món{"\n"}
          <Text style={[styles.modalDishName, { color: theme.tint }]}>
            {dishName}
          </Text>
        </Text>
        <Text style={[styles.modalSubtext, { color: theme.textSecondary }]}>
          Thời gian hoàn thành tuyệt vời! Chúc ngon miệng 😋
        </Text>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: theme.tint }]}
          onPress={onClose}
        >
          <Text style={styles.modalButtonText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ========================
// FAB (Floating Action Button)
// ========================
interface FABProps {
  onPress: () => void;
  visible: boolean;
}

export const CompleteFAB = ({ onPress, visible }: FABProps) => {
  if (!visible) return null;
  
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabIcon}>🎉</Text>
      <Text style={styles.fabText}>Hoàn tất món ăn!</Text>
    </TouchableOpacity>
  );
};

// ========================
// Meta Info Row
// ========================
interface MetaRowProps {
  recipe: RecipeDetails;
  theme: typeof Colors.light;
}

export const MetaRow = ({ recipe, theme }: MetaRowProps) => (
  <View style={[styles.metaRow, { backgroundColor: theme.surfaceSecondary }]}>
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>⏱️</Text>
      <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Chuẩn bị</Text>
      <Text style={[styles.metaValue, { color: theme.text }]}>{recipe.meta.prepTime}</Text>
    </View>
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>🍳</Text>
      <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Nấu</Text>
      <Text style={[styles.metaValue, { color: theme.text }]}>{recipe.meta.cookTime}</Text>
    </View>
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>📊</Text>
      <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Độ khó</Text>
      <Text style={[styles.metaValue, { color: theme.text }]}>{recipe.meta.difficulty}</Text>
    </View>
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>🔥</Text>
      <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Calo</Text>
      <Text style={[styles.metaValue, { color: theme.text }]}>{recipe.meta.calories}</Text>
    </View>
  </View>
);

// ========================
// Servings Badge
// ========================
interface ServingsBadgeProps {
  servings: string;
  tintColor: string;
}

export const ServingsBadge = ({ servings, tintColor }: ServingsBadgeProps) => (
  <View style={[styles.servingsBadge, { backgroundColor: tintColor }]}>
    <Text style={styles.servingsText}>👥 Khẩu phần: {servings}</Text>
  </View>
);

// ========================
// Chef's Tip Box
// ========================
interface TipBoxProps {
  tips: string;
  colorScheme: string;
}

export const TipBox = ({ tips, colorScheme }: TipBoxProps) => (
  <View
    style={[
      styles.tipBox,
      { backgroundColor: colorScheme === "dark" ? "#3D3200" : "#FFF8E1" },
    ]}
  >
    <Text
      style={[
        styles.tipTitle,
        { color: colorScheme === "dark" ? "#FFB300" : "#F57C00" },
      ]}
    >
      💡 Mẹo từ Đầu bếp
    </Text>
    <Text
      style={[
        styles.tipText,
        { color: colorScheme === "dark" ? "#FFD54F" : "#5D4037" },
      ]}
    >
      {tips}
    </Text>
  </View>
);
