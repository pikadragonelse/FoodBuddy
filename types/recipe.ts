// ========================
// Recipe Types
// ========================

/** Nguyên liệu trong công thức */
export interface IngredientItem {
  item: string;
  amount: string;
  note?: string;
}

/** Timer cho từng bước nấu */
export interface StepTimer {
  hasTimer: boolean;
  durationSeconds: number;
  label: string;
}

/** Bước thực hiện trong công thức */
export interface StepItem {
  stepIndex: number;
  instruction: string;
  timer: StepTimer;
  isCritical: boolean;
}

/** Meta info của công thức */
export interface RecipeMeta {
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: string;
  calories: string;
}

/** Chi tiết công thức đầy đủ */
export interface RecipeDetails {
  dishName: string;
  englishName: string;
  description: string;
  meta: RecipeMeta;
  ingredients: IngredientItem[];
  steps: StepItem[];
  tips: string;
  imageUrl?: string;
}

/** Preview công thức (danh sách) */
export interface RecipePreview {
  id: string;
  dishName: string;
  englishName: string;
  description: string;
  difficulty: string;
  cookTime: string;
  imageUrl: string;
}

/** Nguồn dữ liệu công thức */
export type RecipeSource = "local" | "cloud" | "ai";

/** Nguồn dữ liệu tìm kiếm */
export type SearchSource = "cache" | "api";

/** Options cho fetch recipe details */
export interface FetchRecipeOptions {
  onSourceChange?: (source: RecipeSource) => void;
  forceRefresh?: boolean;
}

/** Options cho search recipes */
export interface SearchOptions {
  onSourceChange?: (source: SearchSource) => void;
  forceRefresh?: boolean;
}
