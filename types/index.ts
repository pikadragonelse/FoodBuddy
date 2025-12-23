// ========================
// Re-export all types
// ========================

// Chat
export type {
    ChatIntentType,
    ChatMessage,
    ChatMetadata,
    ChatResponse
} from "./chat";

// Database
export type { SupabaseRecipe } from "./database";

// Explore
export type {
    CategoryItem,
    ExploreResult,
    GeminiDishSuggestion,
    SmartFoodSuggestion
} from "./explore";

// Food (legacy)
export type { AppStage, FoodSuggestion, TagCategory } from "./food";

// Location
export type {
    Coordinates,
    GoongPlace,
    GroundedRestaurant
} from "./location";

// Recipe
export type {
    FetchRecipeOptions,
    IngredientItem,
    RecipeDetails,
    RecipeMeta,
    RecipePreview,
    RecipeSource,
    SearchOptions,
    SearchSource,
    StepItem,
    StepTimer
} from "./recipe";

