
import { SmartFoodSuggestion } from '@/services/foodService';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface FoodCardProps {
  item: SmartFoodSuggestion;
}

export default function FoodCard({ item }: FoodCardProps) {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: item.photoUrl }}
        style={styles.image}
        contentFit="cover"
        transition={500}
      />

      {/* Dark Overlay using View + opacity */}
      <View style={styles.overlay} />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Mood Description (BIG & Emotional) */}
        <Text style={styles.moodText} numberOfLines={3}>
          "{item.reason}"
        </Text>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Suggested Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.activityLabel}>✨ Sau đó thì sao?</Text>
          <Text style={styles.activityText}>
            {item.suggestedActivity}
          </Text>
        </View>

        {/* Price & Rating Badge */}
        <View style={styles.badgeContainer}>
          {item.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {item.rating} ({item.reviewCount || 0})</Text>
            </View>
          )}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{item.priceRange}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)', // Darken background for text legibility
    // Adding a subtle gradient effect using nested views or just solid is fine for "Phủ đen mờ"
    // For better readability at bottom, we might want a localized gradient, 
    // but a full overlay works for the "Blind Date" mystery feel.
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    justifyContent: 'flex-end',
  },
  moodText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 20,
    fontStyle: 'italic',
    lineHeight: 36,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: 16,
    width: '30%',
  },
  activityContainer: {
    marginBottom: 10,
  },
  activityLabel: {
    color: '#FFCB45', // Highlight color
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
    lineHeight: 22,
  },
  priceBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  priceText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  badgeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255,107,0,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ratingText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
});
