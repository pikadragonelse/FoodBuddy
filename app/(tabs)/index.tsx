import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
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
import {
  getSmartFoodSuggestions,
  SmartFoodSuggestion,
} from "@/services/foodService";
import { getAddressFromCoords, getCurrentLocation } from "@/utils/geoUtils";

// ========================
// Types
// ========================
type AppStage = "input" | "loading" | "results" | "match";

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

// ========================
// Scenarios for "Blind Date"
// ========================
interface Scenario {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "1",
    emoji: "💔",
    title: "Đang thất tình",
    description: "Cần món gì đó an ủi tâm hồn",
  },
  {
    id: "2",
    emoji: "💸",
    title: "Mới lãnh lương",
    description: "Tự thưởng bản thân, không lo về giá",
  },
  {
    id: "3",
    emoji: "🏃",
    title: "Muốn đi trốn",
    description: "Tìm góc quán yên bình, ít người",
  },
  {
    id: "4",
    emoji: "🌹",
    title: "Hẹn hò lãng mạn",
    description: "Không gian chill, đồ ăn tinh tế",
  },
  {
    id: "5",
    emoji: "🥴",
    title: "Giải rượu gấp",
    description: "Món nước nóng hổi cho tỉnh táo",
  },
  {
    id: "6",
    emoji: "🥗",
    title: "Eat Clean",
    description: "Healthy balance, không dầu mỡ",
  },
];

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
export default function HomeScreen() {
  const [stage, setStage] = useState<AppStage>("input");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
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

  const handleSearch = async () => {
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

      // Gọi SMART FLOW mới - Pass title + description as tags
      const results = await getSmartFoodSuggestions(
        userLocation.address,
        userLocation.lat,
        userLocation.lng,
        [selectedScenario.title, selectedScenario.description],
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
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* STAGE 1: SCENARIO SELECTION (INPUT) */}
      {stage === "input" && (
        <View className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-8 pb-4">
              <Text className="text-4xl font-bold text-gray-800 mb-2">
                Food Blind Date 🫣
              </Text>
              <Text className="text-lg text-gray-600 mb-4">
                Chọn tâm trạng, AI sẽ dẫn lối...
              </Text>
              <View className="bg-green-100 px-4 py-2 rounded-full self-start">
                <Text className="text-green-600 font-semibold">
                  📍 {userLocation?.address || "Đang lấy vị trí..."}
                </Text>
              </View>
            </View>

            <View className="px-6 pb-32">
              <Text className="text-xl font-bold text-gray-800 mb-4">
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
                      className={`flex-row items-center p-4 rounded-2xl border-2 ${
                        isSelected
                          ? "border-[#FF6B00] bg-orange-50"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm">
                        <Text className="text-2xl">{scenario.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-bold text-lg ${isSelected ? "text-[#FF6B00]" : "text-gray-800"}`}
                        >
                          {scenario.title}
                        </Text>
                        <Text className="text-gray-500 text-sm">
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
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
            <TouchableOpacity
              onPress={handleSearch}
              disabled={!selectedScenario || !userLocation}
              className={`rounded-2xl py-4 px-6 shadow-lg ${
                !selectedScenario || !userLocation
                  ? "bg-gray-300"
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
        <View className="flex-1 justify-center items-center px-6 bg-white">
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
            }}
            style={{ width: 100, height: 100, marginBottom: 30, opacity: 0.8 }}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text className="text-xl font-bold text-gray-800 mt-8 text-center px-8 leading-8">
            "{loadingQuote}"
          </Text>
          <Text className="text-sm text-gray-400 mt-4">
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
          <View className="bg-white rounded-[40px] w-full max-h-[92%] overflow-hidden shadow-2xl relative">
            {/* Close Button Top Right */}
            <TouchableOpacity
              onPress={() => setStage("results")}
              className="absolute top-6 right-6 z-50 bg-white/90 w-10 h-10 rounded-full items-center justify-center shadow-md"
            >
              <Text className="text-gray-900 font-bold text-lg">✕</Text>
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

                <Text className="text-4xl font-black text-center text-gray-900 mb-2 px-2">
                  {matchedItem?.dishName}
                </Text>
                <Text className="text-xl text-center text-gray-500 mb-8 font-semibold italic">
                  @ {matchedItem?.restaurant}
                </Text>

                <View className="bg-orange-50/50 p-6 rounded-[32px] mb-8 border border-orange-100">
                  <View className="flex-row items-start mb-6">
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-4">
                      <Text className="text-xl">📍</Text>
                    </View>
                    <View className="flex-1 pt-1">
                      <Text className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">
                        Địa chỉ
                      </Text>
                      <Text className="text-gray-800 font-bold text-base leading-snug">
                        {matchedItem?.address}
                      </Text>
                      {matchedItem?.distance !== -1 && (
                        <Text className="text-[#FF6B00] font-bold text-xs mt-1">
                          Cách bạn {formatDistance(matchedItem?.distance || 0)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-4">
                      <Text className="text-xl">✨</Text>
                    </View>
                    <View className="flex-1 pt-1">
                      <Text className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">
                        Gợi ý trải nghiệm
                      </Text>
                      <Text className="text-gray-700 italic text-base leading-relaxed font-medium">
                        "{matchedItem?.suggestedActivity}"
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View className="gap-4">
                  <MapButton
                    restaurantName={matchedItem?.restaurant || ""}
                    address={matchedItem?.address}
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
                    className="mt-6 py-5 rounded-[24px] items-center bg-gray-50"
                  >
                    <Text className="text-gray-400 font-bold text-base">
                      Hẹn hò tiếp thôi 💘
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
