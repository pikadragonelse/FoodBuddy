import type { CategoryItem } from "@/types/explore";

// Re-export type for convenience
export type { CategoryItem };

// ========================
// Meal Categories
// ========================
export const MEAL_CATEGORIES: CategoryItem[] = [
  {
    id: "morning",
    name: "Bữa sáng",
    icon: "🌅",
    prompt: "món ăn sáng phổ biến, nhanh gọn",
    color: "#FFB74D",
  },
  {
    id: "lunch",
    name: "Bữa trưa",
    icon: "☀️",
    prompt: "cơm trưa văn phòng, đầy đủ dinh dưỡng",
    color: "#FF7043",
  },
  {
    id: "afternoon",
    name: "Xế chiều",
    icon: "🌤️",
    prompt: "đồ ăn vặt, trà sữa, cafe chiều",
    color: "#7E57C2",
  },
  {
    id: "dinner",
    name: "Bữa tối",
    icon: "🌙",
    prompt: "bữa tối ấm cúng, có thể nhậu nhẹ",
    color: "#5C6BC0",
  },
];

// ========================
// Mood Categories
// ========================
export const MOOD_CATEGORIES: CategoryItem[] = [
  {
    id: "happy",
    name: "Vui vẻ",
    icon: "😊",
    prompt: "ăn mừng, đồ ngon sang chảnh",
    color: "#66BB6A",
  },
  {
    id: "sad",
    name: "Buồn chán",
    icon: "😢",
    prompt: "comfort food, đồ ăn an ủi",
    color: "#42A5F5",
  },
  {
    id: "energy",
    name: "Cần năng lượng",
    icon: "⚡",
    prompt: "đồ ăn nhiều protein, năng lượng cao",
    color: "#FFA726",
  },
  {
    id: "chill",
    name: "Muốn chill",
    icon: "😌",
    prompt: "quán cafe yên tĩnh, không gian đẹp",
    color: "#26A69A",
  },
];

// ========================
// Occasion Categories
// ========================
export const OCCASION_CATEGORIES: CategoryItem[] = [
  {
    id: "date",
    name: "Hẹn hò",
    icon: "💕",
    prompt: "quán lãng mạn, cho cặp đôi",
    color: "#EC407A",
  },
  {
    id: "friends",
    name: "Tụ tập bạn bè",
    icon: "🎉",
    prompt: "quán nhậu, BBQ, buffet chia sẻ",
    color: "#AB47BC",
  },
  {
    id: "alone",
    name: "Một mình",
    icon: "🧘",
    prompt: "quán yên tĩnh, phục vụ nhanh, ngồi một mình thoải mái",
    color: "#78909C",
  },
  {
    id: "family",
    name: "Gia đình",
    icon: "👨‍👩‍👧‍👦",
    prompt: "nhà hàng gia đình, có chỗ cho trẻ em",
    color: "#8D6E63",
  },
];

// ========================
// Budget Categories
// ========================
export const BUDGET_CATEGORIES: CategoryItem[] = [
  {
    id: "budget-cheap",
    name: "Bình dân",
    icon: "💵",
    prompt: "quán bình dân, giá rẻ dưới 50k, vỉa hè",
    color: "#4CAF50",
  },
  {
    id: "budget-mid",
    name: "Vừa phải",
    icon: "💳",
    prompt: "quán tầm trung, giá 50-150k, có máy lạnh",
    color: "#2196F3",
  },
  {
    id: "budget-high",
    name: "Cao cấp",
    icon: "💎",
    prompt: "nhà hàng sang, giá 150-500k, không gian đẹp",
    color: "#9C27B0",
  },
  {
    id: "budget-luxury",
    name: "Sang chảnh",
    icon: "👑",
    prompt: "fine dining, luxury restaurant, giá trên 500k, 5 sao",
    color: "#FF9800",
  },
];

// ========================
// All Categories Combined
// ========================
export const ALL_CATEGORIES: CategoryItem[] = [
  ...MEAL_CATEGORIES,
  ...MOOD_CATEGORIES,
  ...OCCASION_CATEGORIES,
  ...BUDGET_CATEGORIES,
];
