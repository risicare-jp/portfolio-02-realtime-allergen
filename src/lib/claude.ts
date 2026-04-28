import Anthropic from "@anthropic-ai/sdk";
import { ALLERGEN_KEYS, type NormalisedIntent } from "@/lib/types";

const SYSTEM_PROMPT = `You are an intent normaliser for a restaurant allergen lookup system.

Your only job: convert a server's natural-language question (English, Japanese, or mixed) into a structured query.

Output a JSON object with these fields:
- allergen: one of ${ALLERGEN_KEYS.map((k) => `"${k}"`).join(", ")}, or "unknown" if no allergen is mentioned
- itemQuery: the menu item the question is about, in English (e.g. "salmon teriyaki", "california roll"), or null if the question is menu-wide
- scope: "specific_item" | "menu_wide" | "category"
- category: "appetizer" | "main" | "side" | "dessert" | "drink" | null
- confidence: "high" | "medium" | "low"

Allergen mapping cheatsheet (use the canonical key on the left):
- wheat: wheat, gluten, flour, 小麦, グルテン
- egg: egg, eggs, 卵, たまご
- milk: milk, dairy, cream, butter, cheese, lactose, 乳, 牛乳, 乳製品
- soy: soy, soya, soybean, soy sauce, shoyu, miso, 大豆, 醤油, 味噌
- peanut: peanut, groundnut, ピーナッツ, 落花生
- treenut: almond, cashew, walnut, pecan, hazelnut, pistachio, ナッツ, アーモンド
- fish: fish, salmon, tuna, bonito, dashi, 魚, さかな, 鮭, まぐろ, 鰹, 出汁
- shellfish: shrimp, prawn, crab, lobster, shellfish, ebi, kani, エビ, 海老, カニ, 蟹, 貝, 甲殻類
- sesame: sesame, tahini, ごま, 胡麻

Examples:
"Does the salmon teriyaki have shellfish?" → {"allergen":"shellfish","itemQuery":"salmon teriyaki","scope":"specific_item","category":null,"confidence":"high"}
"カリフォルニアロールに卵入ってる？" → {"allergen":"egg","itemQuery":"california roll","scope":"specific_item","category":null,"confidence":"high"}
"Anything on the menu with peanuts?" → {"allergen":"peanut","itemQuery":null,"scope":"menu_wide","category":null,"confidence":"high"}
"Are there any fish-free desserts?" → {"allergen":"fish","itemQuery":null,"scope":"category","category":"dessert","confidence":"high"}
"What time is it?" → {"allergen":"unknown","itemQuery":null,"scope":"menu_wide","category":null,"confidence":"high"}

Return only the JSON object — no surrounding prose, no markdown fences.`;

const INTENT_SCHEMA = {
  type: "object",
  properties: {
    allergen: {
      type: "string",
      enum: [...ALLERGEN_KEYS, "unknown"],
    },
    itemQuery: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    scope: {
      type: "string",
      enum: ["specific_item", "menu_wide", "category"],
    },
    category: {
      anyOf: [
        {
          type: "string",
          enum: ["appetizer", "main", "side", "dessert", "drink"],
        },
        { type: "null" },
      ],
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
    },
  },
  required: ["allergen", "itemQuery", "scope", "category", "confidence"],
  additionalProperties: false,
} as const;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "sk-ant-api03-REPLACE_ME") {
      throw new Error(
        "ANTHROPIC_API_KEY is not configured. Update .env.local with your key from Portfolio 1's Script Properties.",
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export async function normaliseIntent(
  transcript: string,
): Promise<NormalisedIntent> {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: transcript }],
    output_config: {
      format: { type: "json_schema", schema: INTENT_SCHEMA },
    },
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) {
    throw new Error("Claude returned no text block");
  }
  return JSON.parse(textBlock.text) as NormalisedIntent;
}
