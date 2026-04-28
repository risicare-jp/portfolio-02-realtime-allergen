import { SAMPLE_MENU } from "@/data/sample-matrix";
import type {
  AllergenKey,
  ContainmentLevel,
  MenuItem,
  NormalisedIntent,
  OrderCheckResult,
  OrderItemResult,
  QueryResult,
  Verdict,
} from "@/lib/types";

const ALLERGEN_LABEL_JA: Record<AllergenKey, string> = {
  wheat: "小麦",
  egg: "卵",
  milk: "乳製品",
  soy: "大豆",
  peanut: "ピーナッツ",
  treenut: "ナッツ類",
  fish: "魚",
  shellfish: "甲殻類",
  sesame: "ごま",
};

const ALLERGEN_LABEL_EN: Record<AllergenKey, string> = {
  wheat: "wheat",
  egg: "egg",
  milk: "milk",
  soy: "soy",
  peanut: "peanut",
  treenut: "tree nut",
  fish: "fish",
  shellfish: "shellfish",
  sesame: "sesame",
};

export function levelToVerdict(level: ContainmentLevel | undefined): Verdict {
  if (level === "yes") return "×";
  if (level === "trace") return "△";
  if (level === "no") return "○";
  return "○"; // not listed = does not contain
}

const VERDICT_RANK: Record<Verdict, number> = {
  "○": 0,
  "△": 1,
  "×": 2,
  "?": -1,
};

/**
 * Multi-order safety check. For each ordered item, evaluate every selected
 * allergen and return the per-cell verdict + note plus a worst-case summary.
 * No LLM call — explicit selection is a deterministic table lookup.
 */
export function checkOrder(
  itemIds: string[],
  allergens: AllergenKey[],
  menu: MenuItem[] = SAMPLE_MENU,
): OrderCheckResult {
  const items: OrderItemResult[] = itemIds
    .map((id) => menu.find((m) => m.id === id))
    .filter((m): m is MenuItem => Boolean(m))
    .map((item) => {
      const cells = allergens.map((allergen) => {
        const verdict = levelToVerdict(item.contains[allergen]);
        const note =
          verdict === "×" || verdict === "△"
            ? (item.notes?.[allergen] ?? null)
            : null;
        return { allergen, verdict, note };
      });
      const worstRank = cells.reduce(
        (max, c) => Math.max(max, VERDICT_RANK[c.verdict]),
        VERDICT_RANK["○"],
      );
      const worstVerdict: Verdict =
        worstRank === VERDICT_RANK["×"]
          ? "×"
          : worstRank === VERDICT_RANK["△"]
            ? "△"
            : "○";
      return { item, cells, worstVerdict };
    });

  const summary = items.reduce(
    (acc, r) => {
      if (r.worstVerdict === "○") acc.safeCount += 1;
      else if (r.worstVerdict === "△") acc.traceCount += 1;
      else if (r.worstVerdict === "×") acc.containsCount += 1;
      return acc;
    },
    { safeCount: 0, traceCount: 0, containsCount: 0 },
  );

  return { items, summary };
}

function fuzzyMatchItem(query: string, menu: MenuItem[]): MenuItem | null {
  const normalised = query.toLowerCase().trim();
  if (!normalised) return null;

  // Exact ID match
  const byId = menu.find((m) => m.id === normalised);
  if (byId) return byId;

  // English or Japanese name contains the query
  const byName = menu.find(
    (m) =>
      m.name.en.toLowerCase().includes(normalised) ||
      m.name.ja.includes(query.trim()),
  );
  if (byName) return byName;

  // Token-based partial match against English names
  const tokens = normalised.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let bestScore = 0;
  let bestMatch: MenuItem | null = null;
  for (const item of menu) {
    const haystack = item.name.en.toLowerCase();
    const score = tokens.filter((t) => haystack.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }
  return bestScore > 0 ? bestMatch : null;
}

export function lookupVerdict(
  intent: NormalisedIntent,
  rawTranscript: string,
  menu: MenuItem[] = SAMPLE_MENU,
): QueryResult {
  if (intent.allergen === "unknown") {
    return {
      verdict: "?",
      matchedItem: null,
      intent,
      reasoning: {
        en: "I couldn't identify which allergen you're asking about. Try asking, e.g., 'does the salmon teriyaki have shellfish?'",
        ja: "どのアレルゲンを尋ねているか特定できませんでした。「サーモン照り焼きにエビは入ってる？」のように聞いてください。",
      },
      note: null,
      rawTranscript,
    };
  }

  const allergen = intent.allergen;
  const allergenEn = ALLERGEN_LABEL_EN[allergen];
  const allergenJa = ALLERGEN_LABEL_JA[allergen];

  if (intent.scope === "specific_item" && intent.itemQuery) {
    const matched = fuzzyMatchItem(intent.itemQuery, menu);
    if (!matched) {
      return {
        verdict: "?",
        matchedItem: null,
        intent,
        reasoning: {
          en: `"${intent.itemQuery}" is not on the menu I know. Please verify with the kitchen.`,
          ja: `「${intent.itemQuery}」はこのメニューにありません。厨房に確認してください。`,
        },
        note: null,
        rawTranscript,
      };
    }
    const level = matched.contains[allergen];
    const verdict = levelToVerdict(level);
    const reasoningEn =
      verdict === "×"
        ? `${matched.name.en} contains ${allergenEn}.`
        : verdict === "△"
          ? `${matched.name.en} may contain trace ${allergenEn} (cross-contamination risk).`
          : `${matched.name.en} does not contain ${allergenEn}.`;
    const reasoningJa =
      verdict === "×"
        ? `${matched.name.ja}には${allergenJa}が含まれます。`
        : verdict === "△"
          ? `${matched.name.ja}は${allergenJa}の混入の可能性があります（交差汚染リスク）。`
          : `${matched.name.ja}に${allergenJa}は含まれません。`;
    // Surface the per-allergen note only for × and △ — for ○ the note is
    // either irrelevant or not present, and surfacing it is noise.
    const note =
      verdict === "×" || verdict === "△"
        ? (matched.notes?.[allergen] ?? null)
        : null;
    return {
      verdict,
      matchedItem: matched,
      intent,
      reasoning: { en: reasoningEn, ja: reasoningJa },
      note,
      rawTranscript,
    };
  }

  // menu_wide or category scope: aggregate
  const candidates =
    intent.scope === "category" && intent.category
      ? menu.filter((m) => m.category === intent.category)
      : menu;

  const safe: MenuItem[] = [];
  const trace: MenuItem[] = [];
  const contains: MenuItem[] = [];
  for (const item of candidates) {
    const v = levelToVerdict(item.contains[allergen]);
    if (v === "○") safe.push(item);
    else if (v === "△") trace.push(item);
    else if (v === "×") contains.push(item);
  }

  const verdict: Verdict =
    contains.length > 0 ? "×" : trace.length > 0 ? "△" : "○";
  const scopeLabelEn =
    intent.scope === "category" && intent.category
      ? `${intent.category} items`
      : "items on the menu";
  const reasoningEn =
    contains.length > 0
      ? `${contains.length} ${scopeLabelEn} contain ${allergenEn}: ${contains
          .map((i) => i.name.en)
          .join(", ")}.`
      : trace.length > 0
        ? `No ${scopeLabelEn} contain ${allergenEn} as a primary ingredient, but ${trace
            .map((i) => i.name.en)
            .join(", ")} carry cross-contamination risk.`
        : `No ${scopeLabelEn} contain ${allergenEn}.`;
  const reasoningJa =
    contains.length > 0
      ? `${contains.length}品目に${allergenJa}が含まれます: ${contains
          .map((i) => i.name.ja)
          .join("、")}。`
      : trace.length > 0
        ? `主原料には${allergenJa}は含まれませんが、${trace
            .map((i) => i.name.ja)
            .join("、")}に交差汚染の可能性があります。`
        : `${allergenJa}を含む品目はありません。`;

  return {
    verdict,
    matchedItem: contains[0] ?? trace[0] ?? null,
    intent,
    reasoning: { en: reasoningEn, ja: reasoningJa },
    // Aggregate (menu-wide / category) queries don't surface a single note —
    // the reasoning already lists the affected items by name.
    note: null,
    rawTranscript,
  };
}
