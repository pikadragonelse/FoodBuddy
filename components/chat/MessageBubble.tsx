import { Colors } from "@/constants/theme";
import { chatStyles as styles } from "@/styles/chatStyles";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Message, SmartTags } from "./ChatComponents";

// ========================
// Message Bubble Component
// ========================
interface MessageBubbleProps {
  message: Message;
  theme: typeof Colors.light;
  onRecipeClick: (dishName: string, isSpecificDish: boolean) => void;
  onRestaurantClick: (dishName: string, keyword?: string) => void;
  onTagPress: (tag: string) => void;
  isLastMessage: boolean;
}

export const MessageBubble = ({
  message,
  theme,
  onRecipeClick,
  onRestaurantClick,
  onTagPress,
  isLastMessage,
}: MessageBubbleProps) => {
  const { metadata } = message;

  return (
    <View
      style={[
        styles.bubbleContainer,
        message.isUser ? styles.userBubbleContainer : styles.botBubbleContainer,
      ]}
    >
      {/* Avatar for bot */}
      {!message.isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🍳</Text>
        </View>
      )}

      <View style={styles.bubbleContent}>
        {/* Message Text */}
        <View
          style={[
            styles.bubble,
            message.isUser
              ? [styles.userBubble, { backgroundColor: theme.tint }]
              : [styles.botBubble, { backgroundColor: theme.surfaceSecondary }],
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              message.isUser
                ? styles.userText
                : [styles.botText, { color: theme.text }],
            ]}
          >
            {message.text}
          </Text>
        </View>

        {/* Action Buttons based on metadata */}
        {metadata && metadata.dishName && (
          <ActionButtons
            metadata={metadata}
            theme={theme}
            onRecipeClick={onRecipeClick}
            onRestaurantClick={onRestaurantClick}
          />
        )}

        {/* Smart Tags - Only show on last bot message */}
        {!message.isUser && isLastMessage && metadata?.suggestedTags && (
          <SmartTags
            tags={metadata.suggestedTags}
            onTagPress={onTagPress}
            theme={theme}
          />
        )}
      </View>
    </View>
  );
};

// ========================
// Action Buttons Component
// ========================
interface ActionButtonsProps {
  metadata: Message["metadata"];
  theme: typeof Colors.light;
  onRecipeClick: (dishName: string, isSpecificDish: boolean) => void;
  onRestaurantClick: (dishName: string, keyword?: string) => void;
}

const ActionButtons = ({
  metadata,
  theme,
  onRecipeClick,
  onRestaurantClick,
}: ActionButtonsProps) => {
  if (!metadata || !metadata.dishName) return null;

  // Xác định đây là món cụ thể hay danh mục chung
  const isSpecific = metadata.isSpecificDish ?? true;

  // Label và icon khác nhau dựa trên loại
  const recipeButtonLabel = isSpecific
    ? `📖 Xem công thức: ${metadata.dishName}`
    : `🔍 Tìm công thức ${metadata.dishName}`;

  const recipeButtonColor = isSpecific ? "#4CAF50" : "#2196F3";

  return (
    <View style={styles.actionContainer}>
      {metadata.type === "RECIPE" && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: recipeButtonColor }]}
          onPress={() => onRecipeClick(metadata.dishName!, isSpecific)}
        >
          <Text style={styles.actionBtnText}>{recipeButtonLabel}</Text>
        </TouchableOpacity>
      )}

      {metadata.type === "FIND_RESTAURANT" && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.tint }]}
          onPress={() =>
            onRestaurantClick(metadata.dishName!, metadata.keyword)
          }
        >
          <Text style={styles.actionBtnText}>
            🗺️ Tìm quán {metadata.dishName} gần đây
          </Text>
        </TouchableOpacity>
      )}

      {metadata.type === "SUGGESTION" && (
        <>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.tint, marginBottom: 8 },
            ]}
            onPress={() => onRestaurantClick(metadata.dishName!)}
          >
            <Text style={styles.actionBtnText}>
              🗺️ Tìm quán {metadata.dishName}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: recipeButtonColor }]}
            onPress={() => onRecipeClick(metadata.dishName!, isSpecific)}
          >
            <Text style={styles.actionBtnText}>
              {isSpecific
                ? `📖 Cách nấu ${metadata.dishName}`
                : `🔍 Tìm công thức ${metadata.dishName}`}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
