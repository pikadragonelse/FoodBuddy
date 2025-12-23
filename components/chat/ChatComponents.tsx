import { Colors } from "@/constants/theme";
import { chatStyles as styles } from "@/styles/chatStyles";
import type { ChatMessage } from "@/types";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Re-export ChatMessage as Message for backward compatibility
export type Message = ChatMessage;

// ========================
// Smart Tags Component
// ========================
interface SmartTagsProps {
  tags: string[];
  onTagPress: (tag: string) => void;
  theme: typeof Colors.light;
}

export const SmartTags = ({ tags, onTagPress, theme }: SmartTagsProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.smartTagsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.smartTagsScroll}
      >
        {tags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.smartTag,
              { borderColor: theme.tint, backgroundColor: theme.background },
            ]}
            onPress={() => onTagPress(tag)}
            activeOpacity={0.7}
          >
            <Text style={[styles.smartTagText, { color: theme.tint }]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ========================
// Typing Indicator
// ========================
interface TypingIndicatorProps {
  theme: typeof Colors.light;
}

export const TypingIndicator = ({ theme }: TypingIndicatorProps) => (
  <View style={styles.typingContainer}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>🍳</Text>
    </View>
    <View
      style={[styles.typingBubble, { backgroundColor: theme.surfaceSecondary }]}
    >
      <View style={styles.typingDots}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </View>
  </View>
);
