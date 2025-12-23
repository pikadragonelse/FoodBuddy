import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ExploreResult } from "@/services/exploreService";
import { openRestaurantInMaps } from "@/utils/mapLinker";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CompactFoodCardProps {
  item: ExploreResult;
  onPress?: () => void;
}

const formatDistance = (km: number): string => {
  if (km < 0) return "";
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

const CompactFoodCard = ({ item, onPress }: CompactFoodCardProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleDirections = () => {
    // Use the same mapLinker as Home page - only Google Maps
    openRestaurantInMaps(item.restaurantName, item.address);
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surfaceSecondary }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      {/* Image */}
      <Image
        source={{ uri: item.photoUrl }}
        style={[styles.image, { backgroundColor: theme.border }]}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.dishName, { color: theme.text }]} numberOfLines={1}>
          {item.dishName}
        </Text>
        <Text style={[styles.restaurantName, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.restaurantName}
        </Text>

        <View style={styles.metaRow}>
          {item.distance >= 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {formatDistance(item.distance)}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⭐</Text>
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>💰</Text>
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.priceRange}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Direction Button - Google Maps only */}
      <TouchableOpacity style={styles.directionBtn} onPress={handleDirections}>
        <Text style={styles.directionIcon}>🧭</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  dishName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 13,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaIcon: {
    fontSize: 11,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  directionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4285F4", // Google Maps blue
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginLeft: 8,
  },
  directionIcon: {
    fontSize: 20,
  },
});

export default CompactFoodCard;
