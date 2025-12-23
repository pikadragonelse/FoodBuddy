import { Colors } from "@/constants/theme";
import { CategoryItem } from "@/services/exploreService";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CategoryGridProps {
  title: string;
  categories: CategoryItem[];
  onCategoryPress: (category: CategoryItem) => void;
  theme: typeof Colors.light;
}

const CategoryGrid = ({
  title,
  categories,
  onCategoryPress,
  theme,
}: CategoryGridProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.card, { backgroundColor: category.color }]}
            onPress={() => onCategoryPress(category)}
            activeOpacity={0.8}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text style={styles.name}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: 90,
    height: 90,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
  },
});

export default CategoryGrid;
