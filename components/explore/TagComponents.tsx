import { Colors } from "@/constants/theme";
import { CategoryItem } from "@/services/exploreService";
import { exploreStyles as styles } from "@/styles/exploreStyles";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// ========================
// Modern Tag Component
// ========================
interface ModernTagProps {
  item: CategoryItem;
  isSelected: boolean;
  onPress: () => void;
  theme: typeof Colors.light;
  colorScheme: string;
}

export const ModernTag = ({
  item,
  isSelected,
  onPress,
  theme,
  colorScheme,
}: ModernTagProps) => {
  const getTagStyle = () => {
    if (isSelected) {
      return {
        backgroundColor: item.color,
        borderColor: item.color,
      };
    }
    return {
      backgroundColor: "transparent",
      borderColor:
        colorScheme === "dark"
          ? "rgba(255,255,255,0.2)"
          : "rgba(0,0,0,0.15)",
    };
  };

  return (
    <TouchableOpacity
      style={[styles.modernTag, getTagStyle()]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.tagIcon}>{item.icon}</Text>
      <Text
        style={[styles.tagText, { color: isSelected ? "#FFF" : theme.text }]}
      >
        {item.name}
      </Text>
      {isSelected && (
        <View style={styles.tagCheck}>
          <Text style={styles.tagCheckText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ========================
// Tag Section Component
// ========================
interface TagSectionProps {
  title: string;
  subtitle: string;
  categories: CategoryItem[];
  selectedTags: Set<string>;
  onTagPress: (category: CategoryItem) => void;
  theme: typeof Colors.light;
  colorScheme: string;
}

export const TagSection = ({
  title,
  subtitle,
  categories,
  selectedTags,
  onTagPress,
  theme,
  colorScheme,
}: TagSectionProps) => (
  <View style={styles.tagSection}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tagsScroll}
    >
      {categories.map((category) => (
        <ModernTag
          key={category.id}
          item={category}
          isSelected={selectedTags.has(category.id)}
          onPress={() => onTagPress(category)}
          theme={theme}
          colorScheme={colorScheme}
        />
      ))}
    </ScrollView>
  </View>
);
