import { Message, MessageBubble, TypingIndicator } from "@/components/chat";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { sendMessageToGemini } from "@/services/chatService";
import { fetchRecipeDetails } from "@/services/recipeService";
import { chatStyles as styles } from "@/styles/chatStyles";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================
// Initial Greeting Message
// ========================
const INITIAL_MESSAGE: Message = {
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
};

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
    setMessages([INITIAL_MESSAGE]);
  }, []);

  // ========================
  // Message Handlers
  // ========================
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

        // Pre-fetch recipe in background if metadata has dishName
        if (
          response.metadata?.dishName &&
          (response.metadata.type === "RECIPE" ||
            response.metadata.type === "SUGGESTION")
        ) {
          console.log(
            `🔮 [Pre-fetch] Caching recipe in background: ${response.metadata.dishName}`
          );
          fetchRecipeDetails(response.metadata.dishName).catch((err: Error) => {
            console.warn("[Pre-fetch] Failed to cache recipe:", err.message);
          });
        }
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
    [inputText, messages]
  );

  const handleTagPress = (tag: string) => {
    handleSend(tag);
  };

  const handleRecipeClick = (dishName: string, isSpecificDish: boolean) => {
    if (isSpecificDish) {
      // Món cụ thể -> Đi thẳng đến trang chi tiết công thức
      console.log(`📖 [Chat] Navigate to Recipe Detail: ${dishName}`);
      router.push({
        pathname: "/cookbook/[dishName]" as any,
        params: { dishName },
      });
    } else {
      // Danh mục/từ khóa chung -> Đi đến trang tìm kiếm với keyword
      console.log(`🔍 [Chat] Navigate to Recipe Search: ${dishName}`);
      router.push({
        pathname: "/cookbook" as any,
        params: { searchKeyword: dishName },
      });
    }
  };

  const handleRestaurantClick = (dishName: string, keyword?: string) => {
    router.push({
      pathname: "/explore" as any,
      params: { q: keyword || dishName },
    });
  };

  // ========================
  // Render
  // ========================
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
          Trợ lý ẩm thực
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Sẵn sàng phục vụ bạn 👨‍🍳
        </Text>
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
          ListFooterComponent={
            isTyping ? <TypingIndicator theme={theme} /> : null
          }
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.background, borderTopColor: theme.border },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.surfaceSecondary, color: theme.text },
            ]}
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
