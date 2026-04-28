/* eslint-disable @next/next/no-page-custom-font */

interface Direction {
  id: "A" | "B" | "C" | "D";
  name: string;
  tagline: string;
  vibe: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  headingFont: string;
  headingWeight: number;
  bodyFont: string;
  cellSafe: { bg: string; text: string };
  cellTrace: { bg: string; text: string };
  cellContains: { bg: string; text: string };
  borderLeftContains: string;
}

const DIRECTIONS: Direction[] = [
  {
    id: "A",
    name: "抹茶モダン",
    tagline: "Matcha Modern",
    vibe: "茶寮を現代的に再解釈。緑のアクセントで F&B との親和性が高い",
    bg: "#FAF7F0",
    surface: "#FFFFFF",
    text: "#1A1815",
    textMuted: "#7A736B",
    border: "#E8E1D4",
    accent: "#2F4F32",
    accentText: "#FAF7F0",
    headingFont:
      "'Noto Serif JP', 'Fraunces', Georgia, 'Yu Mincho', 'Hiragino Mincho ProN', serif",
    headingWeight: 600,
    bodyFont: "'Inter', system-ui, sans-serif",
    cellSafe: { bg: "#EAF1E0", text: "#3D5C40" },
    cellTrace: { bg: "#F8EFD7", text: "#7A5A12" },
    cellContains: { bg: "#F0DDD5", text: "#7A2A1A" },
    borderLeftContains: "#7A2A1A",
  },
  {
    id: "B",
    name: "藍ミニマル",
    tagline: "Indigo Minimal",
    vibe: "藍染の布のような静けさ。落ち着いて信頼感、業務でも違和感なし",
    bg: "#F5F2EB",
    surface: "#FFFFFF",
    text: "#15171C",
    textMuted: "#6B7080",
    border: "#DDD9CE",
    accent: "#1E3A5F",
    accentText: "#F5F2EB",
    headingFont:
      "'Shippori Mincho', 'Noto Serif JP', Georgia, 'Yu Mincho', serif",
    headingWeight: 500,
    bodyFont: "'Inter', system-ui, sans-serif",
    cellSafe: { bg: "#E5EBE0", text: "#2F4730" },
    cellTrace: { bg: "#EFE6CC", text: "#7A5A12" },
    cellContains: { bg: "#EAD8D0", text: "#6F2820" },
    borderLeftContains: "#1E3A5F",
  },
  {
    id: "C",
    name: "朱ハイコントラスト",
    tagline: "Vermillion High-Contrast",
    vibe: "朱印・鳥居の朱と純黒のシャープな組合せ。エディトリアル誌的な訴求力",
    bg: "#FAF7F0",
    surface: "#FFFFFF",
    text: "#0A0908",
    textMuted: "#5C5852",
    border: "#E8E1D4",
    accent: "#C03030",
    accentText: "#FAF7F0",
    headingFont:
      "'Fraunces', 'Noto Serif JP', Georgia, 'Yu Mincho', serif",
    headingWeight: 600,
    bodyFont: "'Inter', system-ui, sans-serif",
    cellSafe: { bg: "#EFEDE2", text: "#3A4A30" },
    cellTrace: { bg: "#F8EFD7", text: "#7A5A12" },
    cellContains: { bg: "#F5DAD2", text: "#8C2020" },
    borderLeftContains: "#C03030",
  },
  {
    id: "D",
    name: "金茶 落ち着き",
    tagline: "Warm Gold Tranquil (bg = A クリーム)",
    vibe: "金継ぎの金茶アクセント × A のクリーム背景。温度感は維持しつつ明度UP",
    bg: "#FAF7F0",
    surface: "#FFFFFF",
    text: "#3A2E1A",
    textMuted: "#8A7F6B",
    border: "#E5DCC9",
    accent: "#8B6F3A",
    accentText: "#FAF7F0",
    headingFont:
      "'Noto Serif JP', 'Fraunces', Georgia, 'Yu Mincho', serif",
    headingWeight: 700,
    bodyFont: "'Inter', system-ui, sans-serif",
    cellSafe: { bg: "#EAE2CE", text: "#3D4A2A" },
    cellTrace: { bg: "#F4E5BF", text: "#6F4A12" },
    cellContains: { bg: "#EFD4BB", text: "#702817" },
    borderLeftContains: "#702817",
  },
];

function MockCard({ d }: { d: Direction }) {
  return (
    <div
      style={{
        backgroundColor: d.surface,
        color: d.text,
        borderRadius: 12,
        padding: 16,
        borderLeft: `4px solid ${d.borderLeftContains}`,
        fontFamily: d.bodyFont,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          marginBottom: 12,
          borderBottom: `1px solid ${d.border}`,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            fontFamily: d.headingFont,
          }}
        >
          California Roll{" "}
          <span style={{ color: d.textMuted, fontWeight: 400, fontSize: 12 }}>
            / カリフォルニアロール
          </span>
        </div>
        <div
          style={{
            color: d.cellContains.text,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            CONTAINS
          </span>
          <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
            ×
          </span>
        </div>
      </div>
      <div
        style={{
          backgroundColor: d.cellTrace.bg,
          color: d.cellTrace.text,
          padding: 8,
          borderRadius: 6,
          fontSize: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>△</span>
          <span style={{ fontWeight: 500 }}>Soy</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>/ 大豆</span>
        </div>
        <div
          style={{
            marginLeft: 24,
            marginTop: 4,
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
          Skip the shoyu to avoid soy.
          <br />
          <span style={{ opacity: 0.7 }}>醤油を使わなければ大豆を回避可。</span>
        </div>
      </div>
      <div
        style={{
          backgroundColor: d.cellContains.bg,
          color: d.cellContains.text,
          padding: 8,
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>×</span>
          <span style={{ fontWeight: 500 }}>Sesame</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>/ ごま</span>
        </div>
        <div
          style={{
            marginLeft: 24,
            marginTop: 4,
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
          Coated with sesame seeds on the outside.
          <br />
          <span style={{ opacity: 0.7 }}>外側にごまをまぶしてある。</span>
        </div>
      </div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "100%",
          height: 44,
          backgroundColor: color,
          borderRadius: 6,
          border: "1px solid rgba(0,0,0,0.08)",
          marginBottom: 4,
        }}
      />
      <div style={{ fontSize: 9, fontFamily: "monospace" }}>{color}</div>
      <div style={{ fontSize: 9, opacity: 0.6 }}>{label}</div>
    </div>
  );
}

function DirectionColumn({ d }: { d: Direction }) {
  return (
    <div
      style={{
        backgroundColor: d.bg,
        color: d.text,
        padding: 20,
        borderRadius: 14,
        fontFamily: d.bodyFont,
        minHeight: "100%",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            color: d.textMuted,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Variant {d.id}
        </div>
        <h2
          style={{
            fontFamily: d.headingFont,
            fontSize: 24,
            fontWeight: d.headingWeight,
            margin: 0,
            color: d.text,
            lineHeight: 1.2,
            letterSpacing: -0.2,
          }}
        >
          {d.name}
        </h2>
        <div
          style={{
            fontSize: 11,
            color: d.textMuted,
            marginTop: 2,
            fontStyle: "italic",
            fontFamily: d.headingFont,
          }}
        >
          {d.tagline}
        </div>
        <div
          style={{
            fontSize: 11,
            color: d.text,
            opacity: 0.7,
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          {d.vibe}
        </div>
      </div>

      {/* Swatches */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <Swatch color={d.bg} label="bg" />
        <Swatch color={d.text} label="text" />
        <Swatch color={d.accent} label="accent" />
      </div>

      {/* Type sample */}
      <div
        style={{
          backgroundColor: d.surface,
          padding: 14,
          borderRadius: 8,
          marginBottom: 16,
          border: `1px solid ${d.border}`,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            color: d.textMuted,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Portfolio 02 · F&B × AI
        </div>
        <div
          style={{
            fontFamily: d.headingFont,
            fontSize: 22,
            fontWeight: d.headingWeight,
            color: d.text,
            lineHeight: 1.15,
            letterSpacing: -0.3,
            marginBottom: 6,
          }}
        >
          Service-floor
          <br />
          allergen lookup
        </div>
        <div
          style={{
            fontSize: 12,
            color: d.textMuted,
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          Speak a question — get a verified verdict in under a second.
        </div>
        <div style={{ marginTop: 12 }}>
          <span
            style={{
              backgroundColor: d.accent,
              color: d.accentText,
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 6,
              display: "inline-block",
            }}
          >
            Check Order Safety
          </span>
        </div>
      </div>

      {/* Mock card */}
      <MockCard d={d} />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700&display=swap"
      />
      <main
        style={{
          minHeight: "100vh",
          padding: "24px 16px 80px",
          backgroundColor: "#0A0A0A",
          color: "#F5F5F5",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1700, margin: "0 auto" }}>
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#A3A3A3",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              和モダン エディトリアル · 4 Variants
            </div>
            <h1
              style={{
                fontFamily: "'Noto Serif JP', Georgia, serif",
                fontSize: 32,
                fontWeight: 600,
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              色味のバリエーション比較
            </h1>
            <p
              style={{
                color: "#A3A3A3",
                fontSize: 14,
                marginTop: 10,
                maxWidth: 640,
                margin: "10px auto 0",
                lineHeight: 1.6,
              }}
            >
              すべて「和モダン エディトリアル」の系統。色味（緑 / 藍 / 朱 / 金茶）と書体の細かい違いで雰囲気が変わります。A〜D で番号回答してください。
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {DIRECTIONS.map((d) => (
              <DirectionColumn key={d.id} d={d} />
            ))}
          </div>

          <p
            style={{
              marginTop: 32,
              textAlign: "center",
              fontSize: 12,
              color: "#737373",
            }}
          >
            最適な比較には 1280 px 以上のディスプレイ推奨 · スマホでは縦に並びます
          </p>
        </div>
      </main>
    </>
  );
}
