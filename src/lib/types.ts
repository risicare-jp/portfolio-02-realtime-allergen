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

export type LocalisedText = { en: string; ja: string };

export interface MenuItem {
  id: string;
  name: LocalisedText;
  category: "appetizer" | "main" | "side" | "dessert" | "drink";
  contains: Partial<Record<AllergenKey, ContainmentLevel>>;
  /**
   * Per-allergen explanation. Only populated for "yes" / "trace" allergens.
   * - For × (yes): describes WHICH ingredient causes the contamination so
   *   the server can answer "why" if the guest asks.
   * - For △ (trace): describes the cross-contamination risk and, where
   *   possible, the accommodation that would let the dish be served safely.
   * For ○ (no), the note is absent — there is nothing useful to say.
   */
  notes?: Partial<Record<AllergenKey, LocalisedText>>;
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
  reasoning: LocalisedText;
  /**
   * Allergen-specific note for the matched item, if applicable.
   * Populated only when verdict is × or △ and a note exists for that
   * allergen on the matched item. Null otherwise.
   */
  note: LocalisedText | null;
  rawTranscript: string;
}
