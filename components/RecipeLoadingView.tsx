import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Loading Messages
// ========================
const LOADING_MESSAGES = [
  "👨‍🍳 Đang mài dao sắc lẹm...",
  "🔥 Đang nhóm lửa to...",
  "🥬 Đang chọn rau tươi nhất...",
  "🧂 Chuẩn bị gia vị đặc biệt...",
  "🤖 Hỏi ý kiến Gordon Ramsay...",
  "📖 Tra cứu bí quyết gia truyền...",
  "🍲 Nêm nếm lại cho vừa miệng...",
  "✨ Sắp xong rồi, đợi xíu nhé!",
];

// ========================
// Component
// ========================
interface RecipeLoadingViewProps {
  dishName?: string;
}

export default function RecipeLoadingView({
  dishName,
}: RecipeLoadingViewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  
  const [messageIndex, setMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Change message every 2 seconds with fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change message
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Dynamic colors based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFF8F0',
    },
    dishName: {
      color: theme.textSecondary,
    },
    dishNameHighlight: {
      color: theme.tint,
    },
    message: {
      color: theme.text,
    },
    dot: {
      backgroundColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0',
    },
    activeDot: {
      backgroundColor: theme.tint,
    },
    completedDot: {
      backgroundColor: colorScheme === 'dark' ? '#B35A00' : '#FFB74D',
    },
    subtitle: {
      color: theme.textSecondary,
    },
  };

  return (
    <SafeAreaView 
      style={[styles.container, dynamicStyles.container]} 
      edges={["top", "bottom"]}
    >
      {/* Lottie Animation */}
      <View style={styles.lottieContainer}>
        <LottieView
          source={require("@/assets/animations/cooking.json")}
          style={styles.lottie}
          autoPlay
          loop
        />
      </View>

      {/* Dish Name */}
      {dishName && (
        <>
          <Text style={[styles.dishName, dynamicStyles.dishName]}>
            Đang chuẩn bị công thức
          </Text>
          <Text style={[styles.dishNameHighlight, dynamicStyles.dishNameHighlight]}>
            {dishName}
          </Text>
        </>
      )}

      {/* Animated Message */}
      <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
        <Text style={[styles.message, dynamicStyles.message]}>
          {LOADING_MESSAGES[messageIndex]}
        </Text>
      </Animated.View>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        {LOADING_MESSAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              dynamicStyles.dot,
              index === messageIndex && [styles.activeDot, dynamicStyles.activeDot],
              index < messageIndex && dynamicStyles.completedDot,
            ]}
          />
        ))}
      </View>

      {/* Fun Subtitle */}
      <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
        Công thức ngon đang được nấu... 🍳
      </Text>
    </SafeAreaView>
  );
}

// ========================
// Styles
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  lottieContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 200,
    height: 200,
  },
  dishName: {
    fontSize: 16,
    marginBottom: 4,
  },
  dishNameHighlight: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
  },
  messageContainer: {
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    transform: [{ scale: 1.3 }],
  },
  subtitle: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
