import CookingStepItem from "@/components/CookingStepItem";
import RecipeLoadingView from "@/components/RecipeLoadingView";
import {
  fetchRecipeDetails,
  IngredientItem,
  RecipeDetails,
} from "@/services/recipeService";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 260;

// ========================
// Skeleton Loading Component
// ========================
const SkeletonLoader = () => (
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
// Ingredient Item Component
// ========================
interface IngredientRowProps {
  ingredient: IngredientItem;
  isChecked: boolean;
  onToggle: () => void;
}

const IngredientRow = ({
  ingredient,
  isChecked,
  onToggle,
}: IngredientRowProps) => (
  <TouchableOpacity
    style={styles.ingredientRow}
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
        style={[styles.ingredientName, isChecked && styles.ingredientChecked]}
      >
        {ingredient.item}
      </Text>
      <Text style={styles.ingredientAmount}>
        {ingredient.amount} {ingredient.note ? `• ${ingredient.note}` : ""}
      </Text>
    </View>
  </TouchableOpacity>
);

// ========================
// Main Screen Component
// ========================
export default function RecipeDetailScreen() {
  // Keep screen awake during cooking
  useKeepAwake();

  const { dishName } = useLocalSearchParams<{ dishName: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set(),
  );
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFAB, setShowFAB] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<ConfettiCannon>(null);
  const scrollRef = useRef<ScrollView>(null);

  const loadRecipe = async () => {
    if (!dishName) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecipeDetails(dishName);
      setRecipe(data);
    } catch (err: any) {
      console.error("Failed to load recipe:", err);
      setError(err.message || "Không thể tải công thức. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [dishName]);

  // Calculate progress
  const totalSteps = recipe?.steps.length || 1;
  const progress = completedSteps.size / totalSteps;

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Show FAB when > 80% complete
    if (progress >= 0.8 && !showFAB) {
      setShowFAB(true);
    }
  }, [progress]);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return newSet;
    });
  };

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowConfetti(true);
    setShowCompletionModal(true);

    // Auto-hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Loading State
  if (loading) {
    return <RecipeLoadingView dishName={dishName} />;
  }

  // Error State
  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😔</Text>
          <Text style={styles.errorText}>{error || "Đã có lỗi xảy ra"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRecipe}>
            <Text style={styles.retryButtonText}>🔄 Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={styles.backLinkText}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar - Sticky Top */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          {/* Floating Buttons */}
          <SafeAreaView style={styles.floatingButtons} edges={["top"]}>
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.floatingBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={handleSaveToggle}
            >
              <Text style={styles.floatingBtnText}>
                {isSaved ? "❤️" : "🤍"}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Title Section */}
          <Text style={styles.title}>{recipe.dishName}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              📊 Tiến độ: {completedSteps.size}/{totalSteps} bước (
              {Math.round(progress * 100)}%)
            </Text>
          </View>

          {/* Meta Info Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaLabel}>Chuẩn bị</Text>
              <Text style={styles.metaValue}>{recipe.meta.prepTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🍳</Text>
              <Text style={styles.metaLabel}>Nấu</Text>
              <Text style={styles.metaValue}>{recipe.meta.cookTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📊</Text>
              <Text style={styles.metaLabel}>Độ khó</Text>
              <Text style={styles.metaValue}>{recipe.meta.difficulty}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🔥</Text>
              <Text style={styles.metaLabel}>Calo</Text>
              <Text style={styles.metaValue}>{recipe.meta.calories}</Text>
            </View>
          </View>

          {/* Servings Badge */}
          <View style={styles.servingsBadge}>
            <Text style={styles.servingsText}>
              👥 Khẩu phần: {recipe.meta.servings}
            </Text>
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🥬 Nguyên liệu</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <IngredientRow
                  key={index}
                  ingredient={ingredient}
                  isChecked={checkedIngredients.has(index)}
                  onToggle={() => toggleIngredient(index)}
                />
              ))}
            </View>
            <Text style={styles.ingredientHint}>
              💡 Bấm vào nguyên liệu để đánh dấu đã chuẩn bị
            </Text>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍🍳 Các bước thực hiện</Text>
            <Text style={styles.cookingModeHint}>
              🔥 Chế độ nấu ăn: Màn hình sẽ không tắt
            </Text>
            {recipe.steps.map((step) => (
              <CookingStepItem
                key={step.stepIndex}
                step={step}
                isCompleted={completedSteps.has(step.stepIndex)}
                onToggleComplete={() => toggleStep(step.stepIndex)}
              />
            ))}
          </View>

          {/* Chef's Tip */}
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Mẹo từ Đầu bếp</Text>
            <Text style={styles.tipText}>{recipe.tips}</Text>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Floating Complete Button */}
      {showFAB && (
        <TouchableOpacity style={styles.fab} onPress={handleComplete}>
          <Text style={styles.fabIcon}>🎉</Text>
          <Text style={styles.fabText}>Hoàn tất món ăn!</Text>
        </TouchableOpacity>
      )}

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🎊</Text>
            <Text style={styles.modalTitle}>Chúc mừng!</Text>
            <Text style={styles.modalMessage}>
              Bạn đã nấu xong món{"\n"}
              <Text style={styles.modalDishName}>{recipe.dishName}</Text>
            </Text>
            <Text style={styles.modalSubtext}>
              Thời gian hoàn thành tuyệt vời! Chúc ngon miệng 😋
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowCompletionModal(false);
                router.back();
              }}
            >
              <Text style={styles.modalButtonText}>Quay lại danh sách</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ========================
// Styles
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  // Progress Bar
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: "#FF6B00",
    zIndex: 100,
  },
  // Skeleton
  skeletonContainer: {
    flex: 1,
  },
  skeletonImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: "#E0E0E0",
  },
  skeletonBody: {
    padding: 20,
  },
  skeletonTitle: {
    height: 32,
    width: "70%",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonDescription: {
    height: 48,
    width: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 20,
  },
  skeletonMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  skeletonMetaItem: {
    width: 70,
    height: 70,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
  },
  skeletonSection: {
    height: 120,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 16,
  },
  shimmer: {
    opacity: 0.7,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 16,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: "#FF6B00",
    fontSize: 14,
  },
  // Image
  imageContainer: {
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  floatingButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingBtnText: {
    fontSize: 20,
  },
  // Body
  body: {
    padding: 20,
    marginTop: -20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  // Progress Section
  progressSection: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B00",
    textAlign: "center",
  },
  // Meta Row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF8F0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  metaItem: {
    alignItems: "center",
    flex: 1,
  },
  metaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  servingsBadge: {
    backgroundColor: "#FF6B00",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  servingsText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  cookingModeHint: {
    fontSize: 12,
    color: "#FF6B00",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  // Ingredients
  ingredientsList: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  ingredientCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  ingredientCheckboxChecked: {
    backgroundColor: "#FF6B00",
  },
  ingredientCheckmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  ingredientChecked: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  ingredientAmount: {
    fontSize: 13,
    color: "#888",
  },
  ingredientHint: {
    fontSize: 12,
    color: "#AAA",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  // Tip Box
  tipBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB300",
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F57C00",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#5D4037",
    lineHeight: 22,
    fontStyle: "italic",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  fabText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  modalDishName: {
    fontWeight: "700",
    color: "#FF6B00",
    fontSize: 18,
  },
  modalSubtext: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
