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
  const handleDirections = () => {
    // Use the same mapLinker as Home page - only Google Maps
    openRestaurantInMaps(item.restaurantName, item.address);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Image */}
      <Image
        source={{ uri: item.photoUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.dishName} numberOfLines={1}>
          {item.dishName}
        </Text>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.restaurantName}
        </Text>

        <View style={styles.metaRow}>
          {item.distance >= 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>
                {formatDistance(item.distance)}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⭐</Text>
            <Text style={styles.metaText}>{item.rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>💰</Text>
            <Text style={styles.metaText}>{item.priceRange}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
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
    backgroundColor: "#FFF",
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
    backgroundColor: "#F0F0F0",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  dishName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 13,
    color: "#666",
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
    color: "#888",
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
    color: "#999",
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
