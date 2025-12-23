import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ChatMetadata, sendMessageToGemini } from "@/services/chatService";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Types
// ========================
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: Date;
  metadata?: ChatMetadata;
}

// ========================
// Smart Tags Component
// ========================
interface SmartTagsProps {
  tags: string[];
  onTagPress: (tag: string) => void;
  theme: typeof Colors.light;
}

const SmartTags = ({ tags, onTagPress, theme }: SmartTagsProps) => {
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
            style={[styles.smartTag, { borderColor: theme.tint, backgroundColor: theme.background }]}
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
// Message Bubble Component
// ========================
interface MessageBubbleProps {
  message: Message;
  theme: typeof Colors.light;
  onRecipeClick: (dishName: string) => void;
  onRestaurantClick: (dishName: string, keyword?: string) => void;
  onTagPress: (tag: string) => void;
  isLastMessage: boolean;
}

const MessageBubble = ({
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
              message.isUser ? styles.userText : [styles.botText, { color: theme.text }],
            ]}
          >
            {message.text}
          </Text>
        </View>

        {/* Action Buttons based on metadata */}
        {metadata && metadata.dishName && (
          <View style={styles.actionContainer}>
            {metadata.type === "RECIPE" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
                onPress={() => onRecipeClick(metadata.dishName!)}
              >
                <Text style={styles.actionBtnText}>
                  📖 Xem công thức: {metadata.dishName}
                </Text>
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
                  style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
                  onPress={() => onRecipeClick(metadata.dishName!)}
                >
                  <Text style={styles.actionBtnText}>
                    📖 Cách nấu {metadata.dishName}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
// Typing Indicator
// ========================
interface TypingIndicatorProps {
  theme: typeof Colors.light;
}

const TypingIndicator = ({ theme }: TypingIndicatorProps) => (
  <View style={styles.typingContainer}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>🍳</Text>
    </View>
    <View style={[styles.typingBubble, { backgroundColor: theme.surfaceSecondary }]}>
      <View style={styles.typingDots}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </View>
  </View>
);

// ========================
// Main Chat Screen
// ========================
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  // Initial greeting with smart tags
  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "Chào bạn! Mình là FoodBuddy - trợ lý ẩm thực của bạn 🍲\n\nMình có thể giúp bạn:\n• Tìm quán ăn ngon\n• Gợi ý món theo tâm trạng\n• Hướng dẫn nấu ăn\n\nBạn muốn làm gì hôm nay?",
        isUser: false,
        createdAt: new Date(),
        metadata: {
          type: "CHAT",
          suggestedTags: [
            "Đang đói quá!",
            "Gợi ý món sáng",
            "Học nấu ăn",
            "Tìm quán ngon",
          ],
        },
      },
    ]);
  }, []);

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const messageText = textToSend || inputText.trim();
      if (!messageText) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsTyping(true);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const history = messages.slice(-6).map((m) => ({
          role: m.isUser ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        const response = await sendMessageToGemini(messageText, history);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          createdAt: new Date(),
          metadata: response.metadata,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Chat Error:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Rất tiếc, mình đang gặp chút trục trặc. Bạn thử lại nhé! 😅",
          isUser: false,
          createdAt: new Date(),
          metadata: {
            type: "CHAT",
            suggestedTags: ["Thử lại", "Hỏi câu khác"],
          },
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    },
    [inputText, messages],
  );

  const handleTagPress = (tag: string) => {
    // Send the tag as a new message
    handleSend(tag);
  };

  const handleRecipeClick = (dishName: string) => {
    router.push({
      pathname: "/cookbook/[dishName]" as any,
      params: { dishName },
    });
  };

  const handleRestaurantClick = (dishName: string, keyword?: string) => {
    router.push({
      pathname: "/explore" as any,
      params: { q: keyword || dishName },
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <MessageBubble
      message={item}
      theme={theme}
      onRecipeClick={handleRecipeClick}
      onRestaurantClick={handleRestaurantClick}
      onTagPress={handleTagPress}
      isLastMessage={index === messages.length - 1}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Culinary Assistant
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Sẵn sàng phục vụ bạn 👨‍🍳</Text>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingIndicator theme={theme} /> : null}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
            placeholder="Hỏi mình về ẩm thực..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? theme.tint : "#CCC" },
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendBtnText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ========================
// Styles
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // Bubble Container
  bubbleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "85%",
  },
  userBubbleContainer: {
    alignSelf: "flex-end",
  },
  botBubbleContainer: {
    alignSelf: "flex-start",
  },
  // Avatar
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  // Bubble
  bubbleContent: {
    flex: 1,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#FFF",
  },
  botText: {
    // color is set dynamically based on theme
  },
  // Action Buttons
  actionContainer: {
    marginTop: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
  // Smart Tags
  smartTagsContainer: {
    marginTop: 12,
  },
  smartTagsScroll: {
    gap: 8,
  },
  smartTag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  smartTagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  // Typing Indicator
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#AAA",
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  // Input Area
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnText: {
    color: "#FFF",
    fontSize: 20,
  },
});
