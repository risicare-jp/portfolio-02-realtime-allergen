"use client";

const VARIANTS = [
  {
    id: "A",
    name: "柿色 — Kakiiro (vivid Japanese persimmon)",
    accent: "#C16A3D",
    accentHoverBg: "#FAE3D2",
    accentText: "#FAF7F0",
    note: "和モダン定番。最もオレンジ感が強く、焼き柿のような鮮やかさ。",
  },
  {
    id: "B",
    name: "テラコッタ — Terracotta (muted earth orange)",
    accent: "#B5663A",
    accentHoverBg: "#F5DBC5",
    accentText: "#FAF7F0",
    note: "くすんだ赤茶。contains-text #702817 と血脈で繋がる落ち着いた暖色。",
  },
  {
    id: "C",
    name: "アンバー — Amber (gold-leaning warm)",
    accent: "#A86A3F",
    accentHoverBg: "#F4DDC3",
    accentText: "#FAF7F0",
    note: "琥珀色。現状の金茶からの最小変化、温かみありつつ控えめ。",
  },
];

const ORDER_PILLS = [
  { en: "Ebi Tempura", ja: "海老天ぷら", selected: true },
  { en: "Vegetable Tempura", ja: "野菜天ぷら", selected: true },
  { en: "Edamame", ja: "枝豆", selected: false },
  { en: "Salmon Teriyaki", ja: "サーモン照り焼き", selected: false },
];

const ALLERGY_PILLS = [
  { en: "Wheat", ja: "小麦", selected: true },
  { en: "Egg", ja: "卵", selected: false },
  { en: "Tree nut", ja: "ナッツ", selected: true },
  { en: "Sesame", ja: "ごま", selected: true },
];

export default function OrangePreview() {
  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{
        backgroundColor: "#FAF7F0",
        color: "#3A2E1A",
        fontFamily:
          "var(--font-geist-sans), Inter, system-ui, sans-serif",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily:
                "'Noto Serif JP', 'Fraunces', Georgia, 'Yu Mincho', serif",
            }}
          >
            アクセント色比較 — Warm Orange Variants
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8A7F6B" }}>
            マイクアイコンと選択ピルの色を、現状の黄土色 #8B6F3A から温かいオレンジ系へ。
            背景・判定色（safe/trace/contains）はパレットDのまま。
          </p>
        </header>

        <div className="space-y-12">
          {VARIANTS.map((v) => (
            <section
              key={v.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
              style={{ borderColor: "#E5DCC9" }}
            >
              <div className="mb-5 flex items-baseline gap-3">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: v.accent, color: v.accentText }}
                >
                  Option {v.id}
                </span>
                <h2
                  className="text-lg font-semibold"
                  style={{
                    fontFamily:
                      "'Noto Serif JP', 'Fraunces', Georgia, serif",
                  }}
                >
                  {v.name}
                </h2>
                <code className="ml-auto text-xs" style={{ color: "#8A7F6B" }}>
                  {v.accent}
                </code>
              </div>

              <p className="mb-6 text-sm" style={{ color: "#8A7F6B" }}>
                {v.note}
              </p>

              {/* Mic + Transcript bar */}
              <div
                className="mb-6 flex items-center gap-4 rounded-xl p-4"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5DCC9" }}
              >
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-full text-2xl transition"
                  style={{
                    backgroundColor: v.accent,
                    color: v.accentText,
                  }}
                >
                  {/* mic glyph */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 1 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v3" />
                  </svg>
                </button>
                <div className="flex-1">
                  <div
                    className="text-[10px] font-semibold tracking-[0.2em]"
                    style={{ color: "#8A7F6B" }}
                  >
                    TRANSCRIPT
                  </div>
                  <div
                    className="mt-1 rounded-lg border bg-transparent px-3 py-2.5 text-sm"
                    style={{
                      borderColor: "#E5DCC9",
                      backgroundColor: "rgba(245, 239, 227, 0.4)",
                      color: "#8A7F6B",
                    }}
                  >
                    Tap the mic, or type here…
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold"
                  style={{
                    backgroundColor: v.accent,
                    color: v.accentText,
                  }}
                >
                  Check
                </button>
              </div>

              {/* Pills */}
              <div className="grid gap-6 md:grid-cols-[7fr_3fr]">
                <div
                  className="rounded-xl bg-white p-5"
                  style={{ border: "1px solid #E5DCC9" }}
                >
                  <div
                    className="mb-3 text-[10px] font-semibold tracking-[0.2em]"
                    style={{ color: "#8A7F6B" }}
                  >
                    お品書き ORDER
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_PILLS.map((p) => (
                      <Pill
                        key={p.en}
                        en={p.en}
                        ja={p.ja}
                        selected={p.selected}
                        accent={v.accent}
                        accentText={v.accentText}
                        accentHoverBg={v.accentHoverBg}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl bg-white p-5"
                  style={{ border: "1px solid #E5DCC9" }}
                >
                  <div
                    className="mb-3 text-[10px] font-semibold tracking-[0.2em]"
                    style={{ color: "#8A7F6B" }}
                  >
                    アレルギー ALLERGIES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGY_PILLS.map((p) => (
                      <Pill
                        key={p.en}
                        en={p.en}
                        ja={p.ja}
                        selected={p.selected}
                        accent={v.accent}
                        accentText={v.accentText}
                        accentHoverBg={v.accentHoverBg}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Verdict cells (unchanged earth tones, shown for harmony check) */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <VerdictCell label="SAFE" symbol="○" bg="#EAE2CE" text="#3D4A2A" />
                <VerdictCell label="TRACE" symbol="△" bg="#F4E5BF" text="#6F4A12" />
                <VerdictCell label="CONTAINS" symbol="×" bg="#EFD4BB" text="#702817" />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function Pill({
  en,
  ja,
  selected,
  accent,
  accentText,
  accentHoverBg,
}: {
  en: string;
  ja: string;
  selected: boolean;
  accent: string;
  accentText: string;
  accentHoverBg: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-sm transition-all"
      style={
        selected
          ? {
              borderColor: accent,
              backgroundColor: accent,
              color: accentText,
              fontWeight: 600,
            }
          : {
              borderColor: `${accent}4D`,
              backgroundColor: "transparent",
              color: "#3A2E1A",
              fontWeight: 500,
            }
      }
    >
      <span>{en}</span>
      <span style={{ opacity: 0.7, fontSize: "0.85em" }}>{ja}</span>
    </span>
  );
}

function VerdictCell({
  label,
  symbol,
  bg,
  text,
}: {
  label: string;
  symbol: string;
  bg: string;
  text: string;
}) {
  return (
    <div
      className="rounded-lg p-4 text-center"
      style={{ backgroundColor: bg, color: text }}
    >
      <div className="text-3xl font-bold">{symbol}</div>
      <div className="mt-1 text-xs font-semibold tracking-wider">{label}</div>
    </div>
  );
}
