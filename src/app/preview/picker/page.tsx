/* eslint-disable @next/next/no-page-custom-font */
"use client";

import { useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { SAMPLE_MENU } from "@/data/sample-matrix";
import { ALLERGEN_KEYS, type AllergenKey } from "@/lib/types";
import type { MenuItem } from "@/lib/types";

const PALETTE = {
  bg: "#FAF7F0",
  surface: "#FFFFFF",
  text: "#3A2E1A",
  textMuted: "#8A7F6B",
  border: "#E5DCC9",
  accent: "#8B6F3A",
  accentText: "#FAF7F0",
  accentSoft: "#F4ECD9",
  accentBorder: "rgba(139, 111, 58, 0.3)",
};

const HEADING_FONT =
  "'Noto Serif JP', 'Fraunces', Georgia, 'Yu Mincho', serif";
const BODY_FONT = "'Inter', system-ui, sans-serif";

const ALLERGEN_LABEL: Record<AllergenKey, { en: string; ja: string }> = {
  wheat: { en: "Wheat", ja: "小麦" },
  egg: { en: "Egg", ja: "卵" },
  milk: { en: "Milk", ja: "乳" },
  soy: { en: "Soy", ja: "大豆" },
  peanut: { en: "Peanut", ja: "ピーナッツ" },
  treenut: { en: "Tree nut", ja: "ナッツ" },
  fish: { en: "Fish", ja: "魚" },
  shellfish: { en: "Shellfish", ja: "甲殻類" },
  sesame: { en: "Sesame", ja: "ごま" },
};

const ALLERGEN_ICON: Record<AllergenKey, string> = {
  wheat: "🌾",
  egg: "🥚",
  milk: "🥛",
  soy: "🫘",
  peanut: "🥜",
  treenut: "🌰",
  fish: "🐟",
  shellfish: "🦐",
  sesame: "🌱",
};

type Category = MenuItem["category"];

const CATEGORY_LABEL: Record<Category, { en: string; ja: string }> = {
  appetizer: { en: "Appetizer", ja: "前菜" },
  main: { en: "Main", ja: "主菜" },
  side: { en: "Side", ja: "副菜" },
  dessert: { en: "Dessert", ja: "甘味" },
  drink: { en: "Drink", ja: "飲物" },
};

const CATEGORY_ORDER: Category[] = [
  "appetizer",
  "main",
  "side",
  "dessert",
  "drink",
];

const MENU_BY_CATEGORY: Partial<Record<Category, MenuItem[]>> = (() => {
  const groups: Partial<Record<Category, MenuItem[]>> = {};
  for (const item of SAMPLE_MENU) {
    const list = groups[item.category];
    if (list) list.push(item);
    else groups[item.category] = [item];
  }
  return groups;
})();

const cardStyle: CSSProperties = {
  backgroundColor: PALETTE.surface,
  border: `1px solid ${PALETTE.border}`,
  borderRadius: 14,
  padding: 28,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

function SectionHeader({
  label,
  title,
  tagline,
}: {
  label: string;
  title: string;
  tagline: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 3,
          color: PALETTE.textMuted,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <h2
        style={{
          fontFamily: HEADING_FONT,
          fontSize: 26,
          fontWeight: 700,
          margin: 0,
          color: PALETTE.text,
          letterSpacing: -0.3,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 13,
          fontStyle: "italic",
          color: PALETTE.textMuted,
          marginTop: 6,
        }}
      >
        {tagline}
      </div>
    </div>
  );
}

function SubsectionLabel({
  ja,
  en,
  count,
}: {
  ja: string;
  en: string;
  count: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <div>
        <span
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 18,
            fontWeight: 600,
            color: PALETTE.text,
          }}
        >
          {ja}
        </span>
        <span
          style={{
            fontSize: 12,
            color: PALETTE.textMuted,
            marginLeft: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {en}
        </span>
      </div>
      {count > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: PALETTE.accentText,
            backgroundColor: PALETTE.accent,
            padding: "3px 12px",
            borderRadius: 999,
          }}
        >
          {count} selected
        </span>
      )}
    </div>
  );
}

function CategoryDivider({ en, ja }: { en: string; ja: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
        marginTop: 4,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          color: PALETTE.textMuted,
          textTransform: "uppercase",
        }}
      >
        {en}
      </span>
      <span
        style={{
          fontSize: 11,
          color: PALETTE.textMuted,
          fontFamily: HEADING_FONT,
        }}
      >
        {ja}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: PALETTE.border }} />
    </div>
  );
}

function Pill({
  selected,
  onClick,
  en,
  ja,
}: {
  selected: boolean;
  onClick: () => void;
  en: string;
  ja: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: selected ? PALETTE.accent : "transparent",
        color: selected ? PALETTE.accentText : PALETTE.text,
        border: `1.5px solid ${selected ? PALETTE.accent : PALETTE.accentBorder}`,
        borderRadius: 9999,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: selected ? 600 : 500,
        cursor: "pointer",
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: BODY_FONT,
      }}
    >
      <span>{en}</span>
      <span
        style={{
          fontSize: 11,
          opacity: selected ? 0.85 : 0.55,
          fontFamily: HEADING_FONT,
        }}
      >
        {ja}
      </span>
    </button>
  );
}

function toggleArray<T>(setter: Dispatch<SetStateAction<T[]>>) {
  return (v: T) =>
    setter((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
}

export default function PickerPreview() {
  const [items1, setItems1] = useState<string[]>([]);
  const [allergens1, setAllergens1] = useState<AllergenKey[]>([]);
  const [items2, setItems2] = useState<string[]>([]);
  const [allergens2, setAllergens2] = useState<AllergenKey[]>([]);

  const toggleItem1 = toggleArray(setItems1);
  const toggleAllergen1 = toggleArray(setAllergens1);
  const toggleItem2 = toggleArray(setItems2);
  const toggleAllergen2 = toggleArray(setAllergens2);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
      />
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: PALETTE.bg,
          padding: "40px 24px 80px",
          fontFamily: BODY_FONT,
          color: PALETTE.text,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <header style={{ marginBottom: 40, textAlign: "center" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                color: PALETTE.textMuted,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Picker UI Mockups · Variant D 金茶 落ち着き
            </div>
            <h1
              style={{
                fontFamily: HEADING_FONT,
                fontSize: 32,
                fontWeight: 700,
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              選択 UI モックアップ
            </h1>
            <p
              style={{
                fontSize: 13,
                color: PALETTE.textMuted,
                marginTop: 12,
                maxWidth: 560,
                margin: "12px auto 0",
                lineHeight: 1.6,
              }}
            >
              実際にクリックで選択を切り替えられます。スクロールして 1 と 2 を比較してください。
            </p>
          </header>

          {/* IDEA 1: Pill grid — split frames */}
          <section style={{ marginBottom: 80 }}>
            <SectionHeader
              label="Idea 1 · Split Frames"
              title="ピルグリッド × カテゴリ見出し（枠分割）"
              tagline="Order と Allergies を別カードに分けたバージョン"
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Order card */}
              <div style={cardStyle}>
                <SubsectionLabel
                  ja="お品書き"
                  en="Order"
                  count={items1.length}
                />
                {CATEGORY_ORDER.filter((c) => MENU_BY_CATEGORY[c]).map(
                  (cat) => (
                    <div key={cat} style={{ marginBottom: 14 }}>
                      <CategoryDivider
                        en={CATEGORY_LABEL[cat].en}
                        ja={CATEGORY_LABEL[cat].ja}
                      />
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {(MENU_BY_CATEGORY[cat] ?? []).map((item) => (
                          <Pill
                            key={item.id}
                            selected={items1.includes(item.id)}
                            onClick={() => toggleItem1(item.id)}
                            en={item.name.en}
                            ja={item.name.ja}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Allergies card */}
              <div style={cardStyle}>
                <SubsectionLabel
                  ja="アレルギー"
                  en="Allergies"
                  count={allergens1.length}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ALLERGEN_KEYS.map((a) => (
                    <Pill
                      key={a}
                      selected={allergens1.includes(a)}
                      onClick={() => toggleAllergen1(a)}
                      en={ALLERGEN_LABEL[a].en}
                      ja={ALLERGEN_LABEL[a].ja}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* IDEA 1B: side-by-side 7:3 */}
          <section style={{ marginBottom: 80 }}>
            <SectionHeader
              label="Idea 1B · Side-by-Side 7:3"
              title="ピルグリッド × カテゴリ見出し（横並び 7:3）"
              tagline="Order と Allergies を横に並べた版（同じ選択状態を共有）"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "7fr 3fr",
                gap: 16,
                alignItems: "start",
              }}
            >
              {/* Order card */}
              <div style={cardStyle}>
                <SubsectionLabel
                  ja="お品書き"
                  en="Order"
                  count={items1.length}
                />
                {CATEGORY_ORDER.filter((c) => MENU_BY_CATEGORY[c]).map(
                  (cat) => (
                    <div key={cat} style={{ marginBottom: 14 }}>
                      <CategoryDivider
                        en={CATEGORY_LABEL[cat].en}
                        ja={CATEGORY_LABEL[cat].ja}
                      />
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {(MENU_BY_CATEGORY[cat] ?? []).map((item) => (
                          <Pill
                            key={item.id}
                            selected={items1.includes(item.id)}
                            onClick={() => toggleItem1(item.id)}
                            en={item.name.en}
                            ja={item.name.ja}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Allergies card */}
              <div style={cardStyle}>
                <SubsectionLabel
                  ja="アレルギー"
                  en="Allergies"
                  count={allergens1.length}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ALLERGEN_KEYS.map((a) => (
                    <Pill
                      key={a}
                      selected={allergens1.includes(a)}
                      onClick={() => toggleAllergen1(a)}
                      en={ALLERGEN_LABEL[a].en}
                      ja={ALLERGEN_LABEL[a].ja}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* IDEA 2: Menu × Allergen icons */}
          <section>
            <SectionHeader
              label="Idea 2"
              title="ヴァーチャルメニュー × アレルゲンアイコン"
              tagline="Menu list & allergen icon grid — restaurant feel"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr",
                gap: 20,
              }}
            >
              {/* Menu list */}
              <div style={cardStyle}>
                <SubsectionLabel
                  ja="お品書き"
                  en="Menu"
                  count={items2.length}
                />
                <div>
                  {SAMPLE_MENU.map((item, idx) => {
                    const selected = items2.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem2(item.id)}
                        style={{
                          padding: "14px 0",
                          borderTop:
                            idx === 0 ? "none" : `1px solid ${PALETTE.border}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: HEADING_FONT,
                              fontSize: 17,
                              fontWeight: selected ? 700 : 500,
                              color: PALETTE.text,
                              lineHeight: 1.2,
                            }}
                          >
                            {item.name.en}
                          </div>
                          <div
                            style={{
                              fontFamily: HEADING_FONT,
                              fontSize: 13,
                              color: PALETTE.textMuted,
                              marginTop: 3,
                            }}
                          >
                            {item.name.ja}
                          </div>
                        </div>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: `1.5px solid ${selected ? PALETTE.accent : PALETTE.accentBorder}`,
                            backgroundColor: selected
                              ? PALETTE.accent
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: PALETTE.accentText,
                            fontSize: 13,
                            fontWeight: 700,
                            transition: "all 0.15s",
                            flexShrink: 0,
                          }}
                        >
                          {selected && "✓"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Allergen grid */}
              <div style={cardStyle}>
                <SubsectionLabel
                  ja="アレルギー"
                  en="Allergies"
                  count={allergens2.length}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                  }}
                >
                  {ALLERGEN_KEYS.map((a) => {
                    const selected = allergens2.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAllergen2(a)}
                        style={{
                          backgroundColor: selected
                            ? PALETTE.accentSoft
                            : PALETTE.surface,
                          border: `1.5px solid ${selected ? PALETTE.accent : PALETTE.accentBorder}`,
                          borderRadius: 10,
                          padding: "14px 8px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.15s",
                          fontFamily: BODY_FONT,
                        }}
                      >
                        <span style={{ fontSize: 26, lineHeight: 1 }}>
                          {ALLERGEN_ICON[a]}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: PALETTE.text,
                            letterSpacing: 0.3,
                          }}
                        >
                          {ALLERGEN_LABEL[a].en}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: PALETTE.textMuted,
                            fontFamily: HEADING_FONT,
                          }}
                        >
                          {ALLERGEN_LABEL[a].ja}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <p
            style={{
              marginTop: 60,
              textAlign: "center",
              fontSize: 12,
              color: PALETTE.textMuted,
            }}
          >
            <a
              href="/preview"
              style={{ color: PALETTE.accent, textDecoration: "underline" }}
            >
              ← 色味のプレビューに戻る
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
