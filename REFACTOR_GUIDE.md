# FoodBuddy - Cấu trúc code đã được refactor

## 📁 Cấu trúc thư mục mới

```
FoodBuddy/
├── app/(tabs)/
│   └── index.tsx                    # Main screen - chỉ chứa logic UI
├── types/
│   └── food.ts                      # Type definitions (interfaces, types)
├── constants/
│   ├── foodData.ts                  # Mock food database & loading messages
│   └── tagCategories.ts             # Tag categories data
├── components/
│   ├── TagChip.tsx                  # Tag selection chip component
│   ├── FoodCard.tsx                 # Food suggestion card component
│   ├── GrabButton.tsx               # Grab delivery button (đã có sẵn)
│   └── TikTokButton.tsx             # TikTok search button (đã có sẵn)
└── services/
    └── foodService.ts               # API service layer
```

## 📄 Mô tả từng file

### 1. **`types/food.ts`**
Chứa tất cả type definitions:
- `FoodSuggestion` - Interface cho món ăn
- `TagCategory` - Interface cho nhóm tags  
- `AppStage` - Type cho các giai đoạn UI

### 2. **`constants/foodData.ts`**
Chứa mock data và constants:
- `LOADING_MESSAGES` - Array các message hiển thị khi loading
- `MOCK_FOOD_DATABASE` - Database các món ăn mẫu

### 3. **`constants/tagCategories.ts`**
Chứa data cho tag selection:
- `TAG_CATEGORIES` - Array 6 nhóm tags (Tâm trạng, Thời tiết, Dịp & Lễ, etc.)

### 4. **`services/foodService.ts`**
Service layer xử lý API calls:
- `fetchSuggestions(selectedTags)` - Mock API function trả về gợi ý món ăn

### 5. **`components/TagChip.tsx`**
Reusable tag chip component:
- Props: `tag`, `isSelected`, `onPress`
- Tự động đổi style khi được chọn
- Shadow effect cho selected state

### 6. **`components/FoodCard.tsx`**
Card hiển thị thông tin món ăn:
- Props: `suggestion` (FoodSuggestion object)
- Render: Image, Title, Badges, AI Insight, Action buttons
- Tích hợp GrabButton và TikTokButton

### 7. **`app/(tabs)/index.tsx`** (Main screen)
File chính giờ rất gọn gàng, chỉ chứa:
- State management
- Event handlers  
- UI rendering cho 3 stages
- Import các module cần thiết

## ✨ Ưu điểm của cấu trúc mới

### 🎯 **Separation of Concerns**
- UI logic tách biệt với business logic
- Data tách biệt với components
- Types tách biệt với implementation

### 🔄 **Reusability**
- `TagChip` và `FoodCard` có thể dùng ở nhiều nơi
- Service layer dễ thay thế mock data bằng real API
- Constants dễ update mà không ảnh hưởng logic

### 🛠️ **Maintainability**
- Mỗi file có 1 responsibility rõ ràng
- Dễ tìm và sửa bugs
- Dễ test từng phần riêng biệt

### 📈 **Scalability**
- Dễ thêm tags mới vào `tagCategories.ts`
- Dễ thêm món ăn mới vào `foodData.ts`
- Dễ mở rộng service layer với real API

### 👥 **Team Collaboration**
- Nhiều người có thể làm việc trên các file khác nhau
- Conflicts ít hơn khi merge code
- Code review dễ hơn

## 🚀 Next Steps

### Để thay mock data bằng real API:
1. Update `services/foodService.ts`
2. Thay `MOCK_FOOD_DATABASE` bằng API call thực
3. Không cần sửa gì ở components hay main screen!

### Để thêm categories mới:
1. Mở `constants/tagCategories.ts`
2. Thêm object vào `TAG_CATEGORIES` array
3. Done! UI tự động render

### Để customize UI:
1. Components: Sửa `TagChip.tsx` hoặc `FoodCard.tsx`
2. Colors/Styles: Sửa trực tiếp className trong từng component
3. Main screen: Sửa `index.tsx`

## 📝 Ghi chú

- Tất cả imports dùng alias `@/` (đã config sẵn trong tsconfig.json)
- NativeWind (Tailwind) styling được dùng xuyên suốt
- TypeScript strict mode được enable
- Zero errors, production-ready code! ✅
