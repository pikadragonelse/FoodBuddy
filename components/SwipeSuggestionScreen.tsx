
import { SmartFoodSuggestion } from '@/services/foodService';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import FoodCard from './FoodCard';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

interface SwipeSuggestionScreenProps {
  suggestions: SmartFoodSuggestion[];
  onMatch: (item: SmartFoodSuggestion) => void;
  onBack: () => void;
}

export default function SwipeSuggestionScreen({ suggestions, onMatch, onBack }: SwipeSuggestionScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  // Reset animations when index changes
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    cardScale.value = 0; // Pop text effect? Or just reset.
    cardScale.value = withSpring(1);
    
    // Provide haptic feedback on new card
    // Haptics.selectionAsync(); 
  }, [currentIndex]);

  const handleNextCard = (match: boolean) => {
    if (match) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onMatch(suggestions[currentIndex]);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (currentIndex < suggestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // End of stack
        // Reset or notify
        setCurrentIndex(suggestions.length); // Signals end
      }
    }
  };

  // Gesture Handler
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2; // Move vertically slightly
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe detected
        const isRight = event.translationX > 0;
        const throwX = isRight ? width * 1.5 : -width * 1.5;
        
        translateX.value = withTiming(throwX, { duration: 300, easing: Easing.out(Easing.cubic) }, () => {
             runOnJS(handleNextCard)(isRight);
        });
      } else {
        // Spring back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Animated Styles for Top Card
  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: cardScale.value },
      ],
    };
  });

  // Animated Styles for Background Card (Scale & Opacity)
  const animatedNextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0.9, 1]
    );
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0.6, 1]
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Overlay Labels (LIKE / NOPE)
  const likeOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [0, width / 4], [0, 1]),
    };
  });

  const nopeOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [-width / 4, 0], [1, 0]),
    };
  });

  // Render Empty State
  if (currentIndex >= suggestions.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Đã hết gợi ý rồi! 😭</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Thử lại tag khác</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentItem = suggestions[currentIndex];
  const nextItem = suggestions[currentIndex + 1];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        {/* Header simple */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Food Match 🔥</Text>
            <View style={{width: 40}} />
        </View>

        <View style={styles.cardsContainer}>
          {/* Background Card (Next) */}
          {nextItem && (
            <Animated.View style={[styles.cardWrapper, styles.nextCard, animatedNextCardStyle]}>
              <FoodCard item={nextItem} />
            </Animated.View>
          )}

          {/* Foreground Card (Current) */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
              
              {/* Like Badge Overlay */}
              <Animated.View style={[styles.badge, styles.likeBadge, likeOpacity]}>
                <Text style={styles.likeText}>CHỐT ❤️</Text>
              </Animated.View>

              {/* Nope Badge Overlay */}
              <Animated.View style={[styles.badge, styles.nopeBadge, nopeOpacity]}>
                <Text style={styles.nopeText}>NHẠT 👎</Text>
              </Animated.View>

              <FoodCard item={currentItem} />
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Action Buttons (Bottom) */}
        <View style={styles.actionsContainer}>
             <TouchableOpacity 
                style={[styles.actionButton, styles.nopeButton]}
                onPress={() => {
                   translateX.value = withTiming(-width * 1.5, { duration: 300 }, () => runOnJS(handleNextCard)(false));
                }}
             >
                 <Feather name="x" size={32} color="#FF5252" />
             </TouchableOpacity>

             {/* Reveal / Super Match Button */}
             <TouchableOpacity 
                style={[styles.actionButton, styles.revealButton]}
                onPress={() => {
                    // Reveal is essentially a Match
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onMatch(currentItem); 
                }}
             >
                 <Feather name="eye" size={28} color="#fff" />
                 <Text style={styles.revealText}>REVEAL</Text>
             </TouchableOpacity>

             <TouchableOpacity 
                style={[styles.actionButton, styles.likeButton]}
                onPress={() => {
                   translateX.value = withTiming(width * 1.5, { duration: 300 }, () => runOnJS(handleNextCard)(true));
                }}
             >
                 <Feather name="heart" size={32} color="#00C853" />
             </TouchableOpacity>
        </View>
        <Text style={styles.guideText}>Quẹt phải hoặc bấm REVEAL để xem quán!</Text>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  iconButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  cardWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
  },
  nextCard: {
    zIndex: -1,
  },
  
  // Badges
  badge: {
    position: 'absolute',
    top: 50,
    zIndex: 100,
    borderWidth: 4,
    borderRadius: 12,
    padding: 8,
    transform: [{ rotate: '-15deg' }],
  },
  likeBadge: {
    left: 40,
    borderColor: '#00C853',
    transform: [{ rotate: '-15deg' }],
  },
  nopeBadge: {
    right: 40,
    borderColor: '#FF5252',
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00C853',
    textTransform: 'uppercase',
  },
  nopeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF5252',
    textTransform: 'uppercase',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  nopeButton: {
    // borderLeftWidth: 1,
  },
  likeButton: {
     //
  },
  revealButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FF6B00',
      marginBottom: 10, // lift it up slightly
      shadowColor: "#FF6B00",
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
      borderWidth: 4,
      borderColor: '#fff',
  },
  revealText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '900',
      marginTop: 2,
  },
  guideText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 30,
    fontSize: 12,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
  },
  backButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: '#333',
      borderRadius: 12,
  },
  backButtonText: {
      color: '#fff',
      fontWeight: 'bold',
  }
});
