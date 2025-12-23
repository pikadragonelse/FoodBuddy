// ========================
// Supabase Types
// ========================

/** Recipe record từ Supabase */
export interface SupabaseRecipe {
  slug: string;
  name: string;
  ai_data: string | null;
  created_at: string;
  updated_at: string;
}
