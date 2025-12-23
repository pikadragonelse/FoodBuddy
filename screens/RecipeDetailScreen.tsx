import CookingStepItem from "@/components/CookingStepItem";
import RecipeLoadingView from "@/components/RecipeLoadingView";
import {
  CompleteFAB,
  CompletionModal,
  CookingModeHint,
  ErrorState,
  HeroImage,
  IngredientHint,
  IngredientRow,
  MetaRow,
  ProgressSection,
  SectionTitle,
  ServingsBadge,
  SkeletonLoader,
  TipBox,
} from "@/components/recipe";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchRecipeDetails, RecipeDetails, RecipeSource } from "@/services/recipeService";
import { SCREEN_WIDTH, recipeDetailStyles as styles } from "@/styles/recipeDetailStyles";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Main Screen Component
// ========================
export default function RecipeDetailScreen() {
  // Keep screen awake during cooking
  useKeepAwake();

  const { dishName } = useLocalSearchParams<{ dishName: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  // State
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const [dataSource, setDataSource] = useState<RecipeSource | null>(null);

  // Refs
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<ConfettiCannon>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Calculations
  const totalSteps = recipe?.steps.length || 1;
  const progress = completedSteps.size / totalSteps;

  // ========================
  // Data Loading
  // ========================
  const loadRecipe = async () => {
    if (!dishName) return;

    setLoading(true);
    setError(null);
    setDataSource(null);

    try {
      const data = await fetchRecipeDetails(dishName, {
        onSourceChange: (source) => {
          setDataSource(source);
          console.log(`📊 [UI] Data source: ${source}`);
        },
      });
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

  // ========================
  // Progress Animation
  // ========================
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

  // ========================
  // Handlers
  // ========================
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

  const handleCloseModal = () => {
    setShowCompletionModal(false);
    router.back();
  };

  // ========================
  // Render: Loading State
  // ========================
  if (loading) {
    if (dataSource === "ai") {
      return <RecipeLoadingView dishName={dishName} />;
    }
    return <SkeletonLoader />;
  }

  // ========================
  // Render: Error State
  // ========================
  if (error || !recipe) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <ErrorState
          error={error}
          onRetry={loadRecipe}
          onGoBack={() => router.back()}
          theme={theme}
        />
      </SafeAreaView>
    );
  }

  // ========================
  // Render: Main Content
  // ========================
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress Bar - Sticky Top */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: theme.tint,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <HeroImage
          imageUrl={recipe.imageUrl}
          isSaved={isSaved}
          onGoBack={() => router.back()}
          onSaveToggle={handleSaveToggle}
        />

        {/* Content Body */}
        <View style={[styles.body, { backgroundColor: theme.background }]}>
          {/* Title Section */}
          <Text style={[styles.title, { color: theme.text }]}>
            {recipe.dishName}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {recipe.description}
          </Text>

          {/* Progress Indicator */}
          <ProgressSection
            completedSteps={completedSteps.size}
            totalSteps={totalSteps}
            progress={progress}
            theme={theme}
            colorScheme={colorScheme}
          />

          {/* Meta Info Row */}
          <MetaRow recipe={recipe} theme={theme} />

          {/* Servings Badge */}
          <ServingsBadge servings={recipe.meta.servings} tintColor={theme.tint} />

          {/* Ingredients Section */}
          <View style={styles.section}>
            <SectionTitle icon="🥬" title="Nguyên liệu" theme={theme} />
            <View
              style={[
                styles.ingredientsList,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              {recipe.ingredients.map((ingredient, index) => (
                <IngredientRow
                  key={index}
                  ingredient={ingredient}
                  isChecked={checkedIngredients.has(index)}
                  onToggle={() => toggleIngredient(index)}
                  theme={theme}
                />
              ))}
            </View>
            <IngredientHint theme={theme} />
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <SectionTitle icon="👨‍🍳" title="Các bước thực hiện" theme={theme} />
            <CookingModeHint theme={theme} colorScheme={colorScheme} />
            {recipe.steps.map((step) => (
              <CookingStepItem
                key={step.stepIndex}
                step={step}
                isCompleted={completedSteps.has(step.stepIndex)}
                onToggleComplete={() => toggleStep(step.stepIndex)}
                theme={theme}
              />
            ))}
          </View>

          {/* Chef's Tip */}
          <TipBox tips={recipe.tips} colorScheme={colorScheme} />

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Floating Complete Button */}
      <CompleteFAB visible={showFAB} onPress={handleComplete} />

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
      <CompletionModal
        visible={showCompletionModal}
        dishName={recipe.dishName}
        onClose={handleCloseModal}
        theme={theme}
      />
    </View>
  );
}
