# 📱 FoodBuddy - Tabs Navigation Documentation

## Tổng quan

FoodBuddy sử dụng **Expo Router** với **file-based routing** để quản lý navigation. App có 4 tab chính trong bottom navigation.

---

## 🗂️ Cấu trúc thư mục

```
📦 app/
├── (tabs)/                    # Tab navigation group
│   ├── _layout.tsx           # Tab configuration
│   ├── index.tsx             # Home tab (Food Blind Date)
│   ├── chat.tsx              # AI Chat tab
│   ├── explore.tsx           # Explore tab
│   └── cookbook.tsx          # Cookbook tab
│
├── cookbook/                  # Cookbook nested routes
│   └── [dishName].tsx        # Recipe detail (dynamic route)
│
└── _layout.tsx               # Root layout
```

---

## 🎯 Các Tab chính

### 1. 🏠 Home Tab (`index.tsx`)
**Title:** "Home"  
**Icon:** `house.fill`  
**Route:** `/(tabs)/`

#### Mô tả
Trang chủ "Food Blind Date" - Người dùng chọn tâm trạng để AI gợi ý món ăn.

#### Các Stage (Trạng thái)
| Stage | Mô tả |
|-------|-------|
| `input` | Chọn scenario (tâm trạng) |
| `loading` | AI đang tìm kiếm |
| `results` | Hiển thị kết quả dạng Swipe |
| `match` | Modal hiển thị chi tiết món đã match |

#### Flow
```
[Chọn tâm trạng] → [Bấm "Bắt đầu Hẹn Hò"] → [Loading] → [Swipe Cards] → [Match Modal]
```

#### Components sử dụng
- `SwipeSuggestionScreen` - UI swipe cards
- `MapButton` - Mở Google Maps
- `GrabButton` - Mở Grab Food
- `TikTokButton` - Tìm review trên TikTok

---

### 2. 💬 AI Chat Tab (`chat.tsx`)
**Title:** "AI Chat"  
**Icon:** `message.fill`  
**Route:** `/(tabs)/chat`

#### Mô tả
Chat với FoodBuddy AI để:
- Tìm quán ăn
- Gợi ý món theo tâm trạng
- Hỏi công thức nấu ăn

#### Screen chính
```tsx
import ChatScreen from "@/screens/ChatScreen";
```

#### Features
- Smart Tags (nút gợi ý nhanh)
- Typing indicator
- Action buttons (Xem công thức, Tìm quán)
- Phân biệt món cụ thể vs danh mục (`isSpecificDish`)

---

### 3. 🗺️ Explore Tab (`explore.tsx`)
**Title:** "Khám phá"  
**Icon:** `map.fill`  
**Route:** `/(tabs)/explore`

#### Mô tả
Tìm quán ăn theo categories:
- Theo bữa ăn (Sáng, Trưa, Tối)
- Theo tâm trạng (Vui, Buồn, Chill)
- Theo dịp (Hẹn hò, Bạn bè, Gia đình)
- Theo chi phí (Bình dân → Sang chảnh)

#### Screen chính
```tsx
import ExploreScreen from "@/screens/ExploreScreen";
```

#### Features
- Multi-select categories
- AI-powered search
- Real restaurant data từ Goong API
- Hiển thị khoảng cách

---

### 4. 📖 Cookbook Tab (`cookbook.tsx`)
**Title:** "Công thức"  
**Icon:** `book.fill`  
**Route:** `/(tabs)/cookbook`

#### Mô tả
Tìm kiếm và xem công thức nấu ăn.

#### Screen chính
```tsx
import CookbookScreen from "@/screens/CookbookScreen";
```

#### Features
- Tìm kiếm công thức
- Popular recipes mặc định
- Cache-first strategy (nhanh hơn)
- Navigate đến Recipe Detail

#### Nested Route
```
/cookbook/[dishName]  →  RecipeDetailScreen
```

---

## ⚙️ Tab Configuration

### `_layout.tsx`

```tsx
import { Tabs } from "expo-router";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,           // Ẩn header mặc định
        tabBarButton: HapticTab,      // Haptic feedback khi tap
        tabBarStyle: { height: 60, paddingBottom: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", ... }} />
      <Tabs.Screen name="chat" options={{ title: "AI Chat", ... }} />
      <Tabs.Screen name="explore" options={{ title: "Khám phá", ... }} />
      <Tabs.Screen name="cookbook" options={{ title: "Công thức", ... }} />
    </Tabs>
  );
}
```

### Options quan trọng

| Option | Giá trị | Mô tả |
|--------|---------|-------|
| `tabBarActiveTintColor` | `Colors[colorScheme].tint` | Màu tab active (theo theme) |
| `headerShown` | `false` | Ẩn header (screens tự xử lý) |
| `tabBarButton` | `HapticTab` | Thêm haptic feedback |
| `tabBarStyle.height` | `60` | Chiều cao tab bar |

---

## 🔗 Navigation giữa các Tab

### Navigate từ Tab này sang Tab khác

```tsx
import { router } from "expo-router";

// Navigate sang Cookbook tab
router.push("/(tabs)/cookbook");

// Navigate sang Chat tab
router.push("/(tabs)/chat");
```

### Navigate với params

```tsx
// Navigate sang Cookbook với search keyword
router.push({
  pathname: "/(tabs)/cookbook",
  params: { searchKeyword: "Món Việt Nam" },
});

// Navigate sang Explore với query
router.push({
  pathname: "/(tabs)/explore",
  params: { q: "Phở" },
});
```

### Navigate sang nested route

```tsx
// Navigate sang Recipe Detail
router.push({
  pathname: "/cookbook/[dishName]",
  params: { dishName: "Phở Bò" },
});
```

---

## 🎨 Icons sử dụng

App sử dụng **SF Symbols** thông qua `IconSymbol` component:

| Tab | Icon Name |
|-----|-----------|
| Home | `house.fill` |
| AI Chat | `message.fill` |
| Khám phá | `map.fill` |
| Công thức | `book.fill` |

---

## 🌗 Dark Mode Support

Tất cả tabs đều hỗ trợ dark mode thông qua:

```tsx
const colorScheme = useColorScheme();
const theme = Colors[colorScheme ?? "light"];
```

Tab bar tự động thay đổi `activeTintColor` theo theme hiện tại.

---

## 📱 Pattern: Tab = Wrapper, Screen = Logic

FoodBuddy sử dụng pattern tách biệt:

```
app/(tabs)/chat.tsx        →  Thin wrapper (chỉ import screen)
screens/ChatScreen.tsx     →  Full logic + UI
```

**Lợi ích:**
- Screen có thể reuse ở nơi khác
- Dễ test từng screen riêng
- Tab files gọn nhẹ

---

## 🔄 Luồng dữ liệu

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                    │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  Home   │  │  Chat   │  │ Explore │  │Cookbook │           │
│  │   Tab   │  │   Tab   │  │   Tab   │  │   Tab   │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
│       │            │            │            │                  │
│       ▼            ▼            ▼            ▼                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  food   │  │  chat   │  │ explore │  │ recipe  │           │
│  │ Service │  │ Service │  │ Service │  │ Service │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
│       │            │            │            │                  │
│       └────────────┴─────┬──────┴────────────┘                  │
│                          ▼                                      │
│                   ┌─────────────┐                               │
│                   │  Gemini AI  │                               │
│                   │  Goong API  │                               │
│                   │  Unsplash   │                               │
│                   └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Quick Reference

| Tab | Route | Screen File | Service |
|-----|-------|-------------|---------|
| Home | `/(tabs)/` | `app/(tabs)/index.tsx` | `foodService.ts` |
| Chat | `/(tabs)/chat` | `screens/ChatScreen.tsx` | `chatService.ts` |
| Explore | `/(tabs)/explore` | `screens/ExploreScreen.tsx` | `exploreService.ts` |
| Cookbook | `/(tabs)/cookbook` | `screens/CookbookScreen.tsx` | `recipeSearchCache.ts` |
