import { RecipePreview } from "@/services/recipeSearchCache";

// ========================
// Popular Recipes (Default)
// ========================
export const POPULAR_RECIPES: Omit<RecipePreview, "imageUrl">[] = [
  {
    id: "1",
    dishName: "Phở Bò",
    englishName: "Vietnamese Beef Pho",
    description: "Món quốc hồn quốc túy Việt Nam",
    difficulty: "Trung bình",
    cookTime: "3 giờ",
  },
  {
    id: "2",
    dishName: "Bún Chả",
    englishName: "Vietnamese Grilled Pork",
    description: "Đặc sản Hà Nội với thịt nướng thơm lừng",
    difficulty: "Dễ",
    cookTime: "45 phút",
  },
  {
    id: "3",
    dishName: "Cơm Tấm",
    englishName: "Broken Rice",
    description: "Bữa sáng đậm đà miền Nam",
    difficulty: "Dễ",
    cookTime: "30 phút",
  },
  {
    id: "4",
    dishName: "Bánh Mì",
    englishName: "Vietnamese Sandwich",
    description: "Street food nổi tiếng thế giới",
    difficulty: "Dễ",
    cookTime: "20 phút",
  },
  {
    id: "5",
    dishName: "Gỏi Cuốn",
    englishName: "Fresh Spring Rolls",
    description: "Món khai vị thanh mát, healthy",
    difficulty: "Dễ",
    cookTime: "25 phút",
  },
  {
    id: "6",
    dishName: "Bún Bò Huế",
    englishName: "Hue Beef Noodle",
    description: "Cay nồng đậm đà xứ Huế",
    difficulty: "Khó",
    cookTime: "4 giờ",
  },
];

// ========================
// Default Food Image
// ========================
export const DEFAULT_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
