import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initDB } from "@/db";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Giữ splash screen cho đến khi app ready
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDBReady, setIsDBReady] = useState(false);
  const [dbError, setDBError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log("🚀 [App] Initializing database...");
        await initDB();
        console.log("✅ [App] Database ready!");
        setIsDBReady(true);
      } catch (error: any) {
        console.error("❌ [App] Failed to initialize database:", error);
        setDBError(error.message || "Database initialization failed");
        // Vẫn cho app tiếp tục chạy, nhưng cache sẽ không hoạt động
        setIsDBReady(true);
      } finally {
        // Ẩn splash screen sau khi DB đã khởi tạo xong
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, []);

  // Hiện loading screen trong khi chờ DB khởi tạo
  if (!isDBReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Đang khởi tạo...</Text>
      </View>
    );
  }

  // Nếu có lỗi DB, log warning nhưng vẫn cho app chạy
  if (dbError) {
    console.warn("⚠️ [App] Running without local cache:", dbError);
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="cookbook/[dishName]"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
});
