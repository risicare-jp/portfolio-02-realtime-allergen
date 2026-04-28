import type { MenuItem } from "@/lib/types";

export const SAMPLE_MENU: MenuItem[] = [
  {
    id: "salmon-teriyaki",
    name: { en: "Salmon Teriyaki", ja: "サーモン照り焼き" },
    category: "main",
    contains: { wheat: "yes", soy: "yes", fish: "yes", sesame: "trace" },
    notes: {
      wheat: {
        en: "Teriyaki glaze is made from wheat-based shoyu. Cannot be served. Substitute glaze (tamari-based) available with advance notice.",
        ja: "照り焼きダレは小麦由来の醤油ベース。提供不可。事前連絡があればたまり醤油ベースの代替ダレ可。",
      },
      soy: {
        en: "Teriyaki glaze contains shoyu (soy sauce). Cannot accommodate without removing the glaze entirely.",
        ja: "照り焼きダレに醤油が含まれます。ダレを完全に外さない限り対応不可。",
      },
      fish: {
        en: "The dish is salmon — fish is the primary ingredient.",
        ja: "本品はサーモン（魚）が主原料です。",
      },
      sesame: {
        en: "Plated with sesame seed garnish. Can be served without garnish on request.",
        ja: "ごまの飾りを添えて提供。リクエストで省略可。",
      },
    },
  },
  {
    id: "chicken-karaage",
    name: { en: "Chicken Karaage", ja: "鶏の唐揚げ" },
    category: "main",
    contains: { wheat: "yes", egg: "yes", soy: "yes" },
    notes: {
      wheat: {
        en: "Coating uses wheat flour. The dish cannot be made wheat-free.",
        ja: "衣に小麦粉を使用。小麦不使用での提供は不可。",
      },
      egg: {
        en: "Marinade includes beaten egg. Egg-free version unavailable.",
        ja: "下味に溶き卵を使用。卵不使用の代替なし。",
      },
      soy: {
        en: "Marinade is shoyu-based. Removing it changes the dish; not accommodated.",
        ja: "下味は醤油ベース。除外すると別料理になるため対応不可。",
      },
    },
  },
  {
    id: "ebi-tempura",
    name: { en: "Ebi Tempura", ja: "海老天ぷら" },
    category: "appetizer",
    contains: { wheat: "yes", egg: "trace", shellfish: "yes" },
    notes: {
      wheat: {
        en: "Tempura batter is wheat-based. Cannot be served wheat-free.",
        ja: "天ぷらの衣は小麦ベース。小麦不使用での提供は不可。",
      },
      egg: {
        en: "Batter contains a small amount of egg as a binder. Egg-free batter requires advance notice.",
        ja: "衣のつなぎに少量の卵を使用。卵不使用の衣は事前連絡が必要。",
      },
      shellfish: {
        en: "The dish itself is shrimp. Cannot accommodate shellfish allergy.",
        ja: "本品は海老（甲殻類）が主原料。甲殻類アレルギーには提供不可。",
      },
    },
  },
  {
    id: "vegetable-tempura",
    name: { en: "Vegetable Tempura", ja: "野菜天ぷら" },
    category: "appetizer",
    contains: { wheat: "yes", egg: "trace", shellfish: "trace" },
    notes: {
      wheat: {
        en: "Tempura batter is wheat-based.",
        ja: "天ぷらの衣は小麦ベース。",
      },
      egg: {
        en: "Batter contains a small amount of egg as a binder. Egg-free batter requires advance notice.",
        ja: "衣のつなぎに少量の卵を使用。卵不使用の衣は事前連絡が必要。",
      },
      shellfish: {
        en: "Fried in shared oil with shrimp tempura — cross-contamination risk. Can be cooked in dedicated oil with advance notice.",
        ja: "海老天ぷらと同じ油で揚げるため交差汚染リスクあり。事前連絡で専用油での調理可。",
      },
    },
  },
  {
    id: "miso-soup",
    name: { en: "Miso Soup", ja: "味噌汁" },
    category: "side",
    contains: { soy: "yes", fish: "yes" },
    notes: {
      soy: {
        en: "Miso paste is soy-based. Cannot be substituted.",
        ja: "味噌は大豆が原料。代替不可。",
      },
      fish: {
        en: "Dashi is built from bonito (katsuobushi). Vegetarian dashi (kombu only) can be requested.",
        ja: "出汁は鰹節ベース。リクエストで昆布のみのベジタリアン出汁に変更可。",
      },
    },
  },
  {
    id: "edamame",
    name: { en: "Edamame", ja: "枝豆" },
    category: "appetizer",
    contains: { soy: "yes" },
    notes: {
      soy: {
        en: "Edamame is young soybean — soy is the dish itself.",
        ja: "枝豆は若い大豆そのもの。",
      },
    },
  },
  {
    id: "tonkotsu-ramen",
    name: { en: "Tonkotsu Ramen", ja: "豚骨ラーメン" },
    category: "main",
    contains: { wheat: "yes", egg: "yes", soy: "yes", sesame: "trace" },
    notes: {
      wheat: {
        en: "Noodles are wheat-based. No alternative noodle.",
        ja: "麺は小麦ベース。代替麺なし。",
      },
      egg: {
        en: "Soft-boiled egg is a default topping. Can be served without the egg topping.",
        ja: "半熟卵が標準トッピング。卵抜きでの提供可。",
      },
      soy: {
        en: "Tare (seasoning base) is soy-sauce based. Cannot be omitted.",
        ja: "タレ（味付けの素）は醤油ベース。省略不可。",
      },
      sesame: {
        en: "Sesame seeds are a finishing garnish. Can be omitted on request.",
        ja: "仕上げのごまはリクエストで省略可。",
      },
    },
  },
  {
    id: "kake-udon",
    name: { en: "Kake Udon", ja: "かけうどん" },
    category: "main",
    contains: { wheat: "yes", soy: "yes", fish: "yes" },
    notes: {
      wheat: {
        en: "Udon noodles are wheat. No alternative.",
        ja: "うどんは小麦麺。代替なし。",
      },
      soy: {
        en: "Broth is shoyu-based. Cannot be omitted.",
        ja: "汁は醤油ベース。省略不可。",
      },
      fish: {
        en: "Broth is dashi-based (bonito). Vegetarian dashi can be requested.",
        ja: "汁は鰹出汁ベース。リクエストでベジタリアン出汁に変更可。",
      },
    },
  },
  {
    id: "salmon-nigiri",
    name: { en: "Salmon Nigiri", ja: "サーモン握り" },
    category: "main",
    contains: { fish: "yes", soy: "trace" },
    notes: {
      fish: {
        en: "The topping is salmon — fish is the dish itself.",
        ja: "ネタはサーモン（魚）そのもの。",
      },
      soy: {
        en: "Served with optional shoyu (soy sauce) on the side. Skip the shoyu to avoid soy entirely.",
        ja: "醤油は別添え。醤油を使わなければ大豆を完全回避可。",
      },
    },
  },
  {
    id: "california-roll",
    name: { en: "California Roll", ja: "カリフォルニアロール" },
    category: "main",
    contains: { egg: "yes", shellfish: "yes", sesame: "yes", soy: "trace" },
    notes: {
      egg: {
        en: "Japanese mayonnaise (kewpie) inside the roll is egg-yolk based. Egg-free version unavailable.",
        ja: "中の日本のマヨネーズ（キユーピー）は卵黄ベース。卵不使用の代替なし。",
      },
      shellfish: {
        en: "Imitation crab (kanikama) contains pollock and crab extract. Cannot accommodate shellfish allergy.",
        ja: "カニカマには鱈とカニエキスが含まれる。甲殻類アレルギーには提供不可。",
      },
      sesame: {
        en: "Coated with sesame seeds on the outside. Sesame-free roll requires advance prep.",
        ja: "外側にごまをまぶしてある。ごま不使用は事前準備が必要。",
      },
      soy: {
        en: "Optional shoyu service on the side. Skip the shoyu to avoid soy.",
        ja: "醤油は別添え。醤油を使わなければ大豆を回避可。",
      },
    },
  },
  {
    id: "matcha-ice-cream",
    name: { en: "Matcha Ice Cream", ja: "抹茶アイスクリーム" },
    category: "dessert",
    contains: { milk: "yes", egg: "yes" },
    notes: {
      milk: {
        en: "Dairy-based ice cream. Vegan version unavailable.",
        ja: "乳ベースのアイスクリーム。ヴィーガン版なし。",
      },
      egg: {
        en: "Custard base contains egg yolk.",
        ja: "カスタードベースに卵黄を使用。",
      },
    },
  },
  {
    id: "mochi",
    name: { en: "Mochi", ja: "餅" },
    category: "dessert",
    contains: {},
    // No allergen notes — plain rice mochi is safe across all 9 tracked allergens.
  },
];
