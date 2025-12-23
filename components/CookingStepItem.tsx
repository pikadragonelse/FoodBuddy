import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StepItem } from "@/services/recipeService";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CookingStepItemProps {
  step: StepItem;
  isCompleted: boolean;
  onToggleComplete: () => void;
  theme: typeof Colors.light;
}

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function CookingStepItem({
  step,
  isCompleted,
  onToggleComplete,
  theme,
}: CookingStepItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  
  const [timerSeconds, setTimerSeconds] = useState(step.timer.durationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const strikeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate when completed
  useEffect(() => {
    if (isCompleted) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(strikeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(strikeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isCompleted]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const handleTimerComplete = async () => {
    setIsTimerRunning(false);
    setTimerCompleted(true);

    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Try to play sound - fallback to haptic if not available
    try {
      // Use a system-like beep sound URL as fallback
      const { sound } = await Audio.Sound.createAsync(
        { uri: "https://www.soundjay.com/buttons/beep-01a.mp3" },
        { shouldPlay: true },
      );
      // Cleanup after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Fallback: multiple haptics for attention
      console.log("Sound not available, using haptic only");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((r) => setTimeout(r, 200));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const toggleTimer = () => {
    if (timerCompleted) {
      // Reset timer
      setTimerSeconds(step.timer.durationSeconds);
      setTimerCompleted(false);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const resetTimer = () => {
    setTimerSeconds(step.timer.durationSeconds);
    setIsTimerRunning(false);
    setTimerCompleted(false);
  };

  // Critical step colors for dark mode
  const criticalColors = isDark ? {
    containerBg: '#3D1A1A',
    containerBorder: '#8B3A3A',
    tagBg: '#5C2020',
    tagText: '#FF8A80',
  } : {
    containerBg: '#FFF8F8',
    containerBorder: '#FFCDD2',
    tagBg: '#FFEBEE',
    tagText: '#F44336',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
        step.isCritical && {
          backgroundColor: criticalColors.containerBg,
          borderColor: criticalColors.containerBorder,
          borderLeftWidth: 4,
          borderLeftColor: '#F44336',
        },
        { opacity: fadeAnim },
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity style={styles.checkboxArea} onPress={onToggleComplete}>
        <View style={[styles.checkbox, { borderColor: theme.tint }, isCompleted && [styles.checkboxChecked, { backgroundColor: theme.tint }]]}>
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Step Number */}
        <View style={styles.stepHeader}>
          <View
            style={[styles.stepBadge, { backgroundColor: theme.tint }, step.isCritical && styles.criticalBadge]}
          >
            <Text style={styles.stepNumber}>{step.stepIndex}</Text>
          </View>
          {step.isCritical && (
            <View style={[styles.criticalTag, { backgroundColor: criticalColors.tagBg }]}>
              <Text style={[styles.criticalText, { color: criticalColors.tagText }]}>⚠️ Quan trọng</Text>
            </View>
          )}
        </View>

        {/* Instruction */}
        <View style={styles.instructionWrapper}>
          <Text
            style={[styles.instruction, { color: theme.text }, isCompleted && [styles.completedText, { color: theme.textSecondary }]]}
          >
            {step.instruction}
          </Text>
          {isCompleted && (
            <Animated.View
              style={[
                styles.strikethrough,
                { backgroundColor: theme.border },
                {
                  width: strikeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          )}
        </View>

        {/* Timer Button */}
        {step.timer.hasTimer && step.timer.durationSeconds > 0 && (
          <View style={styles.timerSection}>
            <TouchableOpacity
              style={[
                styles.timerBtn,
                isTimerRunning && styles.timerBtnActive,
                timerCompleted && styles.timerBtnCompleted,
              ]}
              onPress={toggleTimer}
            >
              <Text style={styles.timerIcon}>⏱️</Text>
              <Text style={styles.timerText}>
                {timerCompleted
                  ? "✅ Xong!"
                  : isTimerRunning
                    ? formatTime(timerSeconds)
                    : `Bắt đầu ${formatTime(step.timer.durationSeconds)}`}
              </Text>
              {isTimerRunning && <Text style={styles.timerPause}>⏸️</Text>}
            </TouchableOpacity>

            {(isTimerRunning || timerSeconds !== step.timer.durationSeconds) &&
              !timerCompleted && (
                <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
                  <Text style={styles.resetText}>🔄</Text>
                </TouchableOpacity>
              )}
          </View>
        )}

        {/* Timer Label */}
        {step.timer.hasTimer && step.timer.label && (
          <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>{step.timer.label}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  criticalContainer: {
    // Styles now set dynamically in JSX
  },
  checkboxArea: {
    paddingRight: 14,
    paddingTop: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    // backgroundColor set dynamically
  },
  checkmark: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  criticalBadge: {
    backgroundColor: "#F44336",
  },
  stepNumber: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  criticalTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  criticalText: {
    fontSize: 12,
    fontWeight: "600",
  },
  instructionWrapper: {
    position: "relative",
  },
  instruction: {
    fontSize: 16,
    lineHeight: 24,
  },
  completedText: {
    // color set dynamically
  },
  strikethrough: {
    position: "absolute",
    top: "50%",
    left: 0,
    height: 2,
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  timerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  timerBtnActive: {
    backgroundColor: "#FF6B00",
  },
  timerBtnCompleted: {
    backgroundColor: "#E8F5E9",
  },
  timerIcon: {
    fontSize: 18,
  },
  timerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  timerPause: {
    fontSize: 14,
  },
  resetBtn: {
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  resetText: {
    fontSize: 16,
  },
  timerLabel: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
  },
});
