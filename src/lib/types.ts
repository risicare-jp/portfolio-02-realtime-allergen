export const ALLERGEN_KEYS = [
  "wheat",
  "egg",
  "milk",
  "soy",
  "peanut",
  "treenut",
  "fish",
  "shellfish",
  "sesame",
] as const;

export type AllergenKey = (typeof ALLERGEN_KEYS)[number];

export type ContainmentLevel = "yes" | "trace" | "no";

export type Verdict = "○" | "△" | "×" | "?";

export interface MenuItem {
  id: string;
  name: { en: string; ja: string };
  category: "appetizer" | "main" | "side" | "dessert" | "drink";
  contains: Partial<Record<AllergenKey, ContainmentLevel>>;
  notes?: { en?: string; ja?: string };
}

export interface NormalisedIntent {
  allergen: AllergenKey | "unknown";
  itemQuery: string | null;
  scope: "specific_item" | "menu_wide" | "category";
  category: MenuItem["category"] | null;
  confidence: "high" | "medium" | "low";
}

export interface QueryResult {
  verdict: Verdict;
  matchedItem: MenuItem | null;
  intent: NormalisedIntent;
  reasoning: { en: string; ja: string };
  rawTranscript: string;
}
