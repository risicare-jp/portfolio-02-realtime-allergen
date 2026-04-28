"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_MENU } from "@/data/sample-matrix";
import { checkOrder } from "@/lib/lookup";
import {
  ALLERGEN_KEYS,
  type AllergenKey,
  type MenuItem,
  type OrderCheckResult,
  type QueryResult,
  type Verdict,
} from "@/lib/types";

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    [index: number]: { transcript: string };
    length: number;
  }>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

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

// Hero (single-result) verdict styling — strong, audit-ready presence
const VERDICT_HERO: Record<
  string,
  { bg: string; text: string; ring: string; label: string }
> = {
  "○": {
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    ring: "ring-emerald-400",
    label: "SAFE",
  },
  "△": {
    bg: "bg-amber-50",
    text: "text-amber-900",
    ring: "ring-amber-400",
    label: "TRACE / CROSS-CONTAMINATION",
  },
  "×": {
    bg: "bg-rose-50",
    text: "text-rose-900",
    ring: "ring-rose-400",
    label: "CONTAINS",
  },
  "?": {
    bg: "bg-cream-soft",
    text: "text-ink",
    ring: "ring-line",
    label: "UNKNOWN — verify with kitchen",
  },
};

// Per-cell + per-card colours for the multi-order results
const ORDER_CELL_BG: Record<string, string> = {
  "○": "bg-emerald-50",
  "△": "bg-amber-50",
  "×": "bg-rose-50",
  "?": "bg-cream-soft",
};

const ORDER_VERDICT_COLOR: Record<string, string> = {
  "○": "text-emerald-700",
  "△": "text-amber-700",
  "×": "text-rose-700",
  "?": "text-ink-soft",
};

const ORDER_BORDER_COLOR: Record<string, string> = {
  "○": "border-l-emerald-500",
  "△": "border-l-amber-500",
  "×": "border-l-rose-600",
  "?": "border-l-line",
};

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
      className={
        selected
          ? "inline-flex items-center gap-2 rounded-full border-[1.5px] border-gold bg-gold px-4 py-2 text-sm font-semibold text-cream transition-all"
          : "inline-flex items-center gap-2 rounded-full border-[1.5px] border-gold/30 bg-transparent px-4 py-2 text-sm font-medium text-ink transition-all hover:border-gold/60 hover:bg-gold-soft/50"
      }
    >
      <span>{en}</span>
      <span
        className={
          selected
            ? "font-serif text-xs opacity-85"
            : "font-serif text-xs opacity-55"
        }
      >
        {ja}
      </span>
    </button>
  );
}

function CategoryDivider({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="mb-2.5 mt-1 flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[2px] text-ink-soft">
        {en}
      </span>
      <span className="font-serif text-[11px] text-ink-soft">{ja}</span>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

function SectionLabel({
  ja,
  en,
  count,
}: {
  ja: string;
  en: string;
  count?: number;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <div>
        <span className="font-serif text-lg font-semibold text-ink">{ja}</span>
        <span className="ml-2.5 text-xs font-semibold uppercase tracking-[1px] text-ink-soft">
          {en}
        </span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-gold px-3 py-0.5 text-[11px] font-bold text-cream">
          {count} selected
        </span>
      )}
    </div>
  );
}

export default function Home() {
  // === Single voice/text query (Haiku-powered) ===
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor =
      (
        window as unknown as {
          SpeechRecognition?: SpeechRecognitionConstructor;
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;
    if (!Ctor) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onerror = (event) => {
      setError(`Microphone error: ${event.error}`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    setError(null);
    setResult(null);
    setTranscript("");
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start mic");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const submitQuery = async () => {
    const text = transcript.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setResult(json as QueryResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const heroStyle = result ? VERDICT_HERO[result.verdict] : null;

  // === Multi-Order Safety Check (deterministic, no LLM call) ===
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenKey[]>([]);
  const [orderResult, setOrderResult] = useState<OrderCheckResult | null>(null);

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setOrderResult(null);
  };

  const toggleAllergen = (a: AllergenKey) => {
    setSelectedAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
    setOrderResult(null);
  };

  const runOrderCheck = () => {
    if (selectedItemIds.length === 0 || selectedAllergens.length === 0) return;
    setOrderResult(checkOrder(selectedItemIds, selectedAllergens));
  };

  const clearOrder = () => {
    setSelectedItemIds([]);
    setSelectedAllergens([]);
    setOrderResult(null);
  };

  const orderReady = useMemo(
    () => selectedItemIds.length > 0 && selectedAllergens.length > 0,
    [selectedItemIds, selectedAllergens],
  );

  return (
    <main className="min-h-screen bg-cream px-4 py-12 text-ink">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <header className="space-y-3 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-ink-soft">
            Portfolio 02 · F&B × AI
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Service-floor
            <br />
            allergen lookup
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-ink-soft">
            Speak or type a question — &quot;Does the salmon teriyaki have
            shellfish?&quot; — and get a verified ○ / △ / × answer in under a
            second. AI is used only to normalise intent; the verdict comes
            from a deterministic Allergen Matrix lookup.
          </p>
        </header>

        {/* Single voice / text query */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <SectionLabel ja="ひと言で確認" en="Quick Query" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              disabled={!speechSupported}
              className={
                listening
                  ? "flex h-16 w-16 shrink-0 animate-pulse items-center justify-center rounded-full bg-rose-500 text-2xl text-white shadow-lg shadow-rose-200 transition-all"
                  : "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold text-2xl text-cream shadow-sm transition-all hover:bg-gold-deep disabled:cursor-not-allowed disabled:bg-line"
              }
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening ? "■" : "🎙"}
            </button>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-[2px] text-ink-soft">
                Transcript
              </label>
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  speechSupported
                    ? "Tap the mic, or type here…"
                    : "Type your question (mic not supported in this browser)"
                }
                className="mt-1 w-full rounded-lg border border-line bg-cream-soft/40 px-3 py-2.5 text-base text-ink placeholder:text-ink-soft focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitQuery();
                }}
              />
            </div>
            <button
              type="button"
              onClick={submitQuery}
              disabled={loading || !transcript.trim()}
              className="rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-cream shadow-sm transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
            >
              {loading ? "Checking…" : "Check"}
            </button>
          </div>
          {!speechSupported && (
            <p className="mt-3 text-xs text-ink-soft">
              Web Speech API not available in this browser. Best on Chrome
              desktop.
            </p>
          )}
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Single result */}
        {result && heroStyle && (
          <section
            className={`rounded-2xl border-2 p-6 shadow-sm ring-4 ${heroStyle.bg} ${heroStyle.text} ${heroStyle.ring} border-current/20`}
          >
            <div className="flex items-start gap-6">
              <div className="text-7xl font-bold leading-none">
                {result.verdict}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[2px] opacity-70">
                  {heroStyle.label}
                </p>
                {result.matchedItem && (
                  <p className="font-serif text-xl font-semibold">
                    {result.matchedItem.name.en}
                    <span className="ml-2 text-base opacity-70">
                      / {result.matchedItem.name.ja}
                    </span>
                  </p>
                )}
                <p className="text-base leading-relaxed">
                  {result.reasoning.en}
                </p>
                <p className="text-base leading-relaxed opacity-80">
                  {result.reasoning.ja}
                </p>
                {result.note && (
                  <div className="mt-3 space-y-1 rounded-md bg-white/60 p-3 text-sm">
                    <p>
                      <span className="font-semibold">Why:</span>{" "}
                      {result.note.en}
                    </p>
                    <p className="opacity-80">
                      <span className="font-semibold">理由:</span>{" "}
                      {result.note.ja}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <details className="mt-4 text-xs opacity-70">
              <summary className="cursor-pointer font-medium">
                Debug · normalised intent
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-white/60 p-2">
                {JSON.stringify(result.intent, null, 2)}
              </pre>
            </details>
          </section>
        )}

        {/* Multi-Order Safety Check — picker */}
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">
              注文 まるごと判定
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[2px] text-ink-soft">
              Multi-Order Safety Check
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              ゲストの注文と全アレルギーを一度にチェック。AI は使わず、テーブルルックアップのみ・即時応答。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[7fr_3fr]">
            {/* Order card */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <SectionLabel
                ja="お品書き"
                en="Order"
                count={selectedItemIds.length}
              />
              <div className="space-y-4">
                {CATEGORY_ORDER.filter((c) => MENU_BY_CATEGORY[c]).map(
                  (cat) => (
                    <div key={cat}>
                      <CategoryDivider
                        en={CATEGORY_LABEL[cat].en}
                        ja={CATEGORY_LABEL[cat].ja}
                      />
                      <div className="flex flex-wrap gap-2">
                        {(MENU_BY_CATEGORY[cat] ?? []).map((item) => (
                          <Pill
                            key={item.id}
                            selected={selectedItemIds.includes(item.id)}
                            onClick={() => toggleItem(item.id)}
                            en={item.name.en}
                            ja={item.name.ja}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Allergies card */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <SectionLabel
                ja="アレルギー"
                en="Allergies"
                count={selectedAllergens.length}
              />
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_KEYS.map((a) => (
                  <Pill
                    key={a}
                    selected={selectedAllergens.includes(a)}
                    onClick={() => toggleAllergen(a)}
                    en={ALLERGEN_LABEL[a].en}
                    ja={ALLERGEN_LABEL[a].ja}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={runOrderCheck}
              disabled={!orderReady}
              className="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-cream shadow-sm transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
            >
              Check Order Safety
            </button>
            {(selectedItemIds.length > 0 ||
              selectedAllergens.length > 0 ||
              orderResult) && (
              <button
                type="button"
                onClick={clearOrder}
                className="text-xs text-ink-soft underline transition hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {orderResult && (
            <div className="space-y-4 pt-2">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-line bg-cream-soft/60 p-5 text-center">
                <div>
                  <div className="text-3xl font-bold text-emerald-700">
                    {orderResult.summary.safeCount}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[2px] text-ink-soft">
                    SAFE ○
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-700">
                    {orderResult.summary.traceCount}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[2px] text-ink-soft">
                    TRACE △
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-rose-700">
                    {orderResult.summary.containsCount}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[2px] text-ink-soft">
                    CONTAINS ×
                  </div>
                </div>
              </div>

              {/* Per-item cards */}
              {orderResult.items.map(({ item, cells, worstVerdict }) => {
                const worstLabel = VERDICT_HERO[worstVerdict].label;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border-l-4 border-y border-r border-line bg-surface p-5 shadow-sm ${ORDER_BORDER_COLOR[worstVerdict]}`}
                  >
                    <div className="mb-3 flex flex-col gap-2 border-b border-line pb-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <h3 className="font-serif text-base font-semibold text-ink">
                        {item.name.en}
                        <span className="ml-2 text-sm font-normal text-ink-soft">
                          / {item.name.ja}
                        </span>
                      </h3>
                      <div
                        className={`flex shrink-0 items-center gap-2 ${ORDER_VERDICT_COLOR[worstVerdict]}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-[1px]">
                          {worstLabel}
                        </span>
                        <span className="text-3xl font-bold leading-none">
                          {worstVerdict}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {cells.map((c) => (
                        <div
                          key={c.allergen}
                          className={`rounded-lg p-2.5 text-sm ${ORDER_CELL_BG[c.verdict]}`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-5 text-center text-lg font-bold ${ORDER_VERDICT_COLOR[c.verdict]}`}
                            >
                              {c.verdict}
                            </span>
                            <span className="font-medium capitalize text-ink">
                              {ALLERGEN_LABEL[c.allergen].en}
                            </span>
                            <span className="font-serif text-xs text-ink-soft">
                              / {ALLERGEN_LABEL[c.allergen].ja}
                            </span>
                          </div>
                          {c.note && (
                            <div className="ml-7 mt-1 space-y-0.5 text-xs">
                              <p className="text-ink">{c.note.en}</p>
                              <p className="text-ink-soft">{c.note.ja}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Sample matrix table */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="font-serif text-xl font-bold text-ink">
              アレルゲン マトリクス
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[2px] text-ink-soft">
              Sample Matrix · {SAMPLE_MENU.length} items
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cream-soft text-left text-[10px] uppercase tracking-[1px] text-ink-soft">
                  <th className="px-3 py-2.5 font-bold">Item</th>
                  {ALLERGEN_KEYS.map((k) => (
                    <th
                      key={k}
                      className="px-2 py-2.5 text-center font-bold"
                      title={ALLERGEN_LABEL[k].ja}
                    >
                      {ALLERGEN_LABEL[k].en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {SAMPLE_MENU.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-soft/40">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink">
                        {item.name.en}
                      </div>
                      <div className="font-serif text-xs text-ink-soft">
                        {item.name.ja}
                      </div>
                    </td>
                    {ALLERGEN_KEYS.map((k) => {
                      const level = item.contains[k];
                      const symbol: Verdict =
                        level === "yes"
                          ? "×"
                          : level === "trace"
                            ? "△"
                            : "○";
                      const color =
                        level === "yes"
                          ? "text-rose-600"
                          : level === "trace"
                            ? "text-amber-600"
                            : "text-emerald-600";
                      return (
                        <td
                          key={k}
                          className={`px-2 py-2.5 text-center font-bold ${color}`}
                        >
                          {symbol}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="space-y-2 pb-6 text-center text-xs text-ink-soft">
          <p>
            Portfolio 02 · Realtime Allergen Decision Support · Next.js 16 +
            Claude Haiku 4.5
          </p>
          <p>
            <a
              href="https://github.com/risicare-jp/portfolio-02-realtime-allergen"
              className="underline transition hover:text-gold"
            >
              GitHub
            </a>
            <span className="mx-2">·</span>
            <a
              href="/preview"
              className="underline transition hover:text-gold"
            >
              色味プレビュー
            </a>
            <span className="mx-2">·</span>
            <a
              href="/preview/picker"
              className="underline transition hover:text-gold"
            >
              ピッカー比較
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
