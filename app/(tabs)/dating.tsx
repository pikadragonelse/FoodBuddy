import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import components
import GrabButton from "@/components/GrabButton";
import MapButton from "@/components/MapButton";
import SwipeSuggestionScreen from "@/components/SwipeSuggestionScreen";
import TikTokButton from "@/components/TikTokButton";

// Import services
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    getSmartFoodSuggestions,
    SmartFoodSuggestion,
} from "@/services/foodService";
import { getAddressFromCoords, getCoordsFromAddress, getCurrentLocation } from "@/utils/geoUtils";

// ========================
// Types
// ========================
type AppStage = "input" | "loading" | "results" | "match";

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

import { Scenario, SCENARIOS } from "@/constants/tagCategories";

// ========================
// Fun Loading Quotes
// ========================
const LOADING_QUOTES = [
  "Đang hỏi thổ địa khu này... 📞",
  "Đang lướt TikTok tìm review... 💃",
  "Đang nếm thử nước dùng... 🍜",
  "Đang tính calo (đùa thôi, ăn đi)... 🍔",
  "Đang check ví tiền của bạn... 💸",
  "Đang tìm quán có máy lạnh mát rượi... ❄️",
];

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

// ========================
// Main Component
// ========================
export default function DatingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const [stage, setStage] = useState<AppStage>("input");
  const [searchRadius, setSearchRadius] = useState(5);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Location Edit State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<SmartFoodSuggestion[]>([]);
  const [matchedItem, setMatchedItem] = useState<SmartFoodSuggestion | null>(
    null,
  );
  const [loadingQuote, setLoadingQuote] = useState(LOADING_QUOTES[0]);

  useEffect(() => {
    initializeLocation();
  }, []);

  // Loading Cycling Effect
  useEffect(() => {
    let interval: any;
    if (stage === "loading") {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % LOADING_QUOTES.length;
        setLoadingQuote(LOADING_QUOTES[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const initializeLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        const address = await getAddressFromCoords(
          coords.latitude,
          coords.longitude,
        );
        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          address,
        });
      }
    } catch (error) {
      console.error("Failed to get location:", error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!manualAddress.trim()) return;

    setIsUpdatingLocation(true);
    try {
      const coords = await getCoordsFromAddress(manualAddress);
      if (coords) {
        // Create a nice display address (or use what user typed)
        // Let's reverse geocode to get formatted address, or just use input
        // To be safe and nice, lets use input combined with what we found or just input.
        // Better: Use input as display, but coords are real.

        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          address: manualAddress,
        });
        setShowLocationModal(false);
        setManualAddress(""); // reset
      } else {
        Alert.alert("Không tìm thấy", "Không tìm thấy địa chỉ này. Vui lòng thử lại cụ thể hơn (Ví dụ: 123 Nguyễn Huệ, Quận 1)");
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể cập nhật vị trí.");
    } finally {
      setIsUpdatingLocation(false);
    }
  };


  const handleSearch = async (forceRefresh = false) => {
    if (!selectedScenario) {
      Alert.alert("Oops!", 'Chọn 1 kịch bản để bắt đầu "Blind Date" nhé! 🤔');
      return;
    }

    if (!userLocation) {
      Alert.alert("Cần GPS", "Vui lòng bật GPS để tìm quán gần bạn nhất!");
      return;
    }

    try {
      setStage("loading");
      setLoadingQuote(LOADING_QUOTES[0]); // Reset quote

      if (forceRefresh) {
        // Clear specific cache if rerolling
        console.log("🔄 Force refreshing...");
        // For simplicity, we can just not use the cache in getSmartFoodSuggestions 
        // OR better, we clear it here. But the cache key is location+tags.
        // Let's implement a clearCacheFor in cacheService or just skip cache in foodService.
      }

      // Gọi SMART FLOW mới - Pass title + description as tags
      const results = await getSmartFoodSuggestions(
        userLocation.address,
        userLocation.lat,
        userLocation.lng,
        [selectedScenario.title, selectedScenario.description],
        forceRefresh, // Passing forceRefresh here
        searchRadius // Pass selected radius
      );

      setSuggestions(results);
      setStage("results");
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert(
        "Lỗi 🤖",
        error.message || "Không thể tìm quán. Thử lại sau nhé!",
      );
      setStage("input");
    }
  };

  const handleMatch = (item: SmartFoodSuggestion) => {
    setMatchedItem(item);
    setStage("match" as AppStage);
  };

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: theme.background }} 
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* STAGE 1: SCENARIO SELECTION (INPUT) */}
      {stage === "input" && (
        <View className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-8 pb-4">
              <Text 
                className="text-4xl font-bold mb-2"
                style={{ color: theme.text }}
              >
                Food Blind Date 🫣
              </Text>
              <Text 
                className="text-lg mb-4"
                style={{ color: theme.textSecondary }}
              >
                Chọn tâm trạng, AI sẽ dẫn lối...
              </Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(true)}
                activeOpacity={0.7}
                className="px-4 py-2 rounded-full self-start flex-row items-center border"
                style={{ 
                  backgroundColor: isDark ? "rgba(34, 197, 94, 0.1)" : "rgba(220, 252, 231, 1)",
                  borderColor: isDark ? "rgba(34, 197, 94, 0.3)" : "rgba(187, 247, 208, 1)"
                }}
              >
                <Text 
                  className="font-bold mr-2 text-sm"
                  style={{ color: isDark ? "#4ade80" : "#15803d" }}
                >
                  📍 {userLocation?.address || "Đang lấy vị trí..."}
                </Text>
                <View 
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#FFFFFF" }}
                >
                  <Text 
                    className="font-bold text-[10px]"
                    style={{ color: isDark ? "#4ade80" : "#15803d" }}
                  >
                    ĐỔI
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="px-6 pb-32">
              <Text 
                className="text-xl font-bold mb-4"
                style={{ color: theme.text }}
              >
                Bạn đang thế nào?
              </Text>
              <View className="gap-3">
                {SCENARIOS.map((scenario) => {
                  const isSelected = selectedScenario?.id === scenario.id;
                  return (
                    <TouchableOpacity
                      key={scenario.id}
                      onPress={() =>
                        setSelectedScenario(isSelected ? null : scenario)
                      }
                      activeOpacity={0.7}
                      className="flex-row items-center p-4 rounded-2xl border-2"
                      style={{
                        borderColor: isSelected ? "#FF6B00" : (isDark ? "#3A3D3E" : "#F3F4F6"),
                        backgroundColor: isSelected 
                          ? (isDark ? "rgba(255, 107, 0, 0.1)" : "#FFF7ED") 
                          : (isDark ? "#2A2D2E" : "#FFFFFF")
                      }}
                    >
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm"
                        style={{ backgroundColor: isDark ? "#3A3D3E" : "#FFFFFF" }}
                      >
                        <Text className="text-2xl">{scenario.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="font-bold text-lg"
                          style={{ color: isSelected ? "#FF6B00" : theme.text }}
                        >
                          {scenario.title}
                        </Text>
                        <Text 
                          className="text-sm"
                          style={{ color: theme.textSecondary }}
                        >
                          {scenario.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="w-6 h-6 bg-[#FF6B00] rounded-full items-center justify-center">
                          <Text className="text-white font-bold">✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Distance Filter Section */}
            <View className="px-6 pb-32">
              <Text 
                className="text-xl font-bold mb-4"
                style={{ color: theme.text }}
              >
                Khoảng cách tìm kiếm
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {[2, 5, 10, 15, 20].map((km) => {
                  const isSelected = searchRadius === km;
                  return (
                    <TouchableOpacity
                      key={km}
                      onPress={() => setSearchRadius(km)}
                      activeOpacity={0.7}
                      className="mr-3 px-5 py-3 rounded-full border"
                      style={{
                        backgroundColor: isSelected 
                          ? (isDark ? "#FFFFFF" : "#1F2937") 
                          : (isDark ? "#2A2D2E" : "#FFFFFF"),
                        borderColor: isSelected 
                          ? (isDark ? "#FFFFFF" : "#1F2937") 
                          : (isDark ? "#3A3D3E" : "#E5E7EB"),
                      }}
                    >
                      <Text
                        className="font-bold"
                        style={{ color: isSelected ? (isDark ? "#000000" : "#FFFFFF") : theme.textSecondary }}
                      >
                        {km}km
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>

          <View 
            className="absolute bottom-0 left-0 right-0 border-t px-6 py-4"
            style={{ 
              backgroundColor: theme.background,
              borderTopColor: theme.border
            }}
          >
            <TouchableOpacity
              onPress={() => handleSearch(false)}
              disabled={!selectedScenario || !userLocation}
              className={`rounded-2xl py-4 px-6 shadow-lg ${!selectedScenario || !userLocation
                ? (isDark ? "bg-gray-700" : "bg-gray-300")
                : "bg-[#FF6B00]"
                }`}
            >
              <Text className="text-center font-bold text-lg text-white">
                {!userLocation ? "📍 Đang lấy GPS..." : `🚀 Bắt đầu Hẹn Hò`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STAGE 2: LOADING */}
      {stage === "loading" && (
        <View 
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: theme.background }}
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
            }}
            style={{ width: 100, height: 100, marginBottom: 30, opacity: isDark ? 0.9 : 0.8 }}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text 
            className="text-xl font-bold mt-8 text-center px-8 leading-8"
            style={{ color: theme.text }}
          >
            "{loadingQuote}"
          </Text>
          <Text 
            className="text-sm mt-4"
            style={{ color: theme.textSecondary }}
          >
            AI đang nấu data, chờ chút nha... 🍳
          </Text>
        </View>
      )}

      {/* STAGE 3: SWIPE RESULTS (Blind Date UI) */}
      {(stage === "results" || stage === "match") && (
        <SwipeSuggestionScreen
          suggestions={suggestions}
          onMatch={handleMatch}
          onBack={() => setStage("input")}
          onReroll={() => handleSearch(true)}
        />
      )}

      {/* STAGE 4: MATCH REVEAL (MODAL) */}
      <Modal
        visible={stage === "match" && !!matchedItem}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStage("results")}
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-4">
          <View 
            className="rounded-[40px] w-full max-h-[92%] overflow-hidden shadow-2xl relative"
            style={{ backgroundColor: theme.background }}
          >
            {/* Close Button Top Right */}
            <TouchableOpacity
              onPress={() => setStage("results")}
              className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full items-center justify-center shadow-md"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)" }}
            >
              <Text 
                className="font-bold text-lg"
                style={{ color: isDark ? "#FFFFFF" : "#11181C" }}
              >
                ✕
              </Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Hero Image */}
              <View className="relative">
                <Image
                  source={{ uri: matchedItem?.photoUrl }}
                  className="w-full h-[360px]"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/10" />
              </View>

              <View className="px-6 pb-6">
                {/* Badge 'It's a Match' */}
                <View className="items-center -mt-10 mb-6">
                  <View className="bg-white p-2 rounded-full shadow-xl">
                    <View className="bg-[#FF6B00] px-8 py-3 rounded-full">
                      <Text className="text-white font-extrabold text-sm uppercase tracking-widest">
                        FOOD MATCH 🔥
                      </Text>
                    </View>
                  </View>
                </View>

                <Text 
                  className="text-4xl font-black text-center mb-2 px-2"
                  style={{ color: theme.text }}
                >
                  {matchedItem?.dishName}
                </Text>
                <Text 
                  className="text-xl text-center mb-2 font-semibold italic"
                  style={{ color: theme.textSecondary }}
                >
                  @ {matchedItem?.restaurant}
                </Text>

                {matchedItem?.rating && (
                  <View className="flex-row items-center justify-center mb-6">
                    <View 
                      className="px-3 py-1 rounded-full flex-row items-center"
                      style={{ backgroundColor: isDark ? "rgba(255, 107, 0, 0.2)" : "#FFEDD5" }}
                    >
                      <Text className="text-orange-600 font-black text-sm">⭐ {matchedItem.rating}</Text>
                      <Text 
                        className="text-xs ml-1"
                        style={{ color: isDark ? "#FF8A3D" : "#FB923C" }}
                      >
                        ({matchedItem.reviewCount} reviews)
                      </Text>
                    </View>
                  </View>
                )}

                <View 
                  className="p-6 rounded-[32px] mb-8 border"
                  style={{ 
                    backgroundColor: isDark ? "rgba(255, 107, 0, 0.05)" : "rgba(255, 247, 237, 0.5)",
                    borderColor: isDark ? "rgba(255, 107, 0, 0.2)" : "#FFEDD5"
                  }}
                >
                  <View className="flex-row items-start">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center shadow-sm mr-4"
                      style={{ backgroundColor: theme.background }}
                    >
                      <Text className="text-xl">📍</Text>
                    </View>
                    <View className="flex-1 pt-1">
                      <Text 
                        className="text-[10px] uppercase font-black tracking-widest mb-1"
                        style={{ color: theme.textSecondary }}
                      >
                        Địa chỉ
                      </Text>
                      <Text 
                        className="font-bold text-base leading-snug"
                        style={{ color: theme.text }}
                      >
                        {matchedItem?.address}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        {matchedItem?.distance !== -1 && (
                          <Text className="text-[#FF6B00] font-bold text-xs mr-3">
                            Cách bạn {formatDistance(matchedItem?.distance || 0)}
                          </Text>
                        )}
                        {matchedItem?.openNow !== undefined && (
                          <View 
                            className="px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: matchedItem.openNow ? (isDark ? "rgba(34, 197, 94, 0.2)" : "#DCFCE7") : (isDark ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2") }}
                          >
                            <Text 
                              className="text-[10px] font-black"
                              style={{ color: matchedItem.openNow ? "#16a34a" : "#dc2626" }}
                            >
                              {matchedItem.openNow ? 'ĐANG MỞ CỬA' : 'ĐÓNG CỬA'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {matchedItem?.suggestedActivity && (
                  <View 
                    className="p-6 rounded-[32px] mb-8 border"
                    style={{ 
                      backgroundColor: isDark ? "rgba(59, 130, 246, 0.05)" : "rgba(239, 246, 255, 0.5)",
                      borderColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#DBEAFE"
                    }}
                  >
                    <View className="flex-row items-start">
                      <View 
                        className="w-10 h-10 rounded-full items-center justify-center shadow-sm mr-4"
                        style={{ backgroundColor: theme.background }}
                      >
                        <Text className="text-xl">✨</Text>
                      </View>
                      <View className="flex-1">
                        <Text 
                          className="text-xs font-black mb-1 uppercase tracking-widest"
                          style={{ color: isDark ? "#60A5FA" : "#3B82F6" }}
                        >Gợi ý trải nghiệm</Text>
                        <Text 
                          className="font-bold text-base leading-relaxed"
                          style={{ color: isDark ? "#DBEAFE" : "#1E3A8A" }}
                        >
                          {matchedItem.suggestedActivity}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View className="gap-4 px-6">
                <MapButton
                  restaurantName={matchedItem?.restaurant || ""}
                  address={matchedItem?.address}
                  googleMapsUrl={matchedItem?.googleMapsUrl}
                />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <GrabButton
                      keyword={matchedItem?.keywords.grab || ""}
                      restaurantName={matchedItem?.restaurant || ""}
                    />
                  </View>
                </View>

                <TikTokButton keyword={matchedItem?.keywords.tiktok || ""} />

                <TouchableOpacity
                  onPress={() => setStage("results")}
                  className="mt-6 py-5 rounded-[24px] items-center"
                  style={{ backgroundColor: theme.surfaceSecondary }}
                >
                  <Text 
                    className="font-bold text-base"
                    style={{ color: theme.textSecondary }}
                  >
                    Hẹn hò tiếp thôi 💘
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View 
            className="rounded-t-[32px] p-6 pb-10"
            style={{ backgroundColor: theme.background }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text 
                className="text-2xl font-bold"
                style={{ color: theme.text }}
              >
                Chọn vị trí của bạn 📍
              </Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)} className="p-2">
                <Text 
                  className="font-bold text-lg"
                  style={{ color: theme.textSecondary }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text 
              className="mb-2"
              style={{ color: theme.textSecondary }}
            >
              Nhập địa chỉ bạn muốn tìm kiếm xung quanh:
            </Text>
            <TextInput
              value={manualAddress}
              onChangeText={setManualAddress}
              placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
              placeholderTextColor={isDark ? "#666" : "#999"}
              className="p-4 rounded-xl text-lg mb-4"
              style={{ 
                backgroundColor: theme.surfaceSecondary,
                color: theme.text
              }}
              autoFocus={true}
              onSubmitEditing={handleUpdateLocation}
            />

            <TouchableOpacity
              onPress={handleUpdateLocation}
              disabled={isUpdatingLocation || !manualAddress.trim()}
              className={`py-4 rounded-xl items-center ${isUpdatingLocation || !manualAddress.trim() 
                ? (isDark ? "bg-gray-700" : "bg-gray-300") 
                : "bg-[#FF6B00]"
                }`}
            >
              {isUpdatingLocation ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Cập nhật vị trí</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                initializeLocation(); // Reset to GPS
                setShowLocationModal(false);
              }}
              className="mt-4 py-2 items-center"
            >
              <Text className="text-[#FF6B00] font-bold">📍 Sử dụng GPS hiện tại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
