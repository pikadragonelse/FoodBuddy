import { FoodSuggestion } from '@/types/food';

// ========================
// Loading Messages
// ========================
export const LOADING_MESSAGES = [
  'Đang gọi điện cho thổ địa... 📞',
  'Đang check TikTok... 📱',
  'Đang so sánh giá... 💰',
  'Đang hỏi ý kiến food blogger... 🎭',
  'Đang tính khoảng cách... 📍',
  'Đang đọc review... ⭐',
  'Đang phân tích thói quen ăn uống... 🧠',
  'Đang lục database 10,000 quán... 🗂️',
];

// ========================
// Mock Food Database
// ========================
export const MOCK_FOOD_DATABASE: FoodSuggestion[] = [
  {
    id: '1',
    dishName: 'Bún Đậu Mắm Tôm',
    restaurantName: 'Bún Đậu Cô Bông',
    priceRange: '55k',
    distance: '1.2km',
    reason: 'Mắm tôm đậm đà, chả cốm giòn rụm. Review 4.8⭐ trên TikTok!',
    imageURL: 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?q=80&w=1000&auto=format&fit=crop',
    grabKeyword: 'bun dau co bong sai gon',
    tiktokKeyword: 'bun dau mam tom sai gon',
  },
  {
    id: '2',
    dishName: 'Phở Bò Đặc Biệt',
    restaurantName: 'Phở Hùng',
    priceRange: '65k',
    distance: '2.5km',
    reason: 'Nước dùng ninh 8 tiếng, thịt mềm tan. Quán nổi tiếng 30 năm!',
    imageURL: 'https://images.unsplash.com/photo-1582878826618-c05326eff950?q=80&w=1000&auto=format&fit=crop',
    grabKeyword: 'pho hung quan 1',
    tiktokKeyword: 'pho bo sai gon ngon',
  },
  {
    id: '3',
    dishName: 'Cơm Tấm Sườn Bì',
    restaurantName: 'Cơm Tấm Mộc',
    priceRange: '45k',
    distance: '0.8km',
    reason: 'Sườn nướng thơm lừng, giá sinh viên. Bán hết veo trước 8PM!',
    imageURL: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
    grabKeyword: 'com tam moc sai gon',
    tiktokKeyword: 'com tam suon bi',
  },
];
