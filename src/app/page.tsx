"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_MENU } from "@/data/sample-matrix";
import { checkOrder } from "@/lib/lookup";
import {
  ALLERGEN_KEYS,
  type AllergenKey,
  type OrderCheckResult,
  type QueryResult,
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
  wheat: { en: "wheat", ja: "小麦" },
  egg: { en: "egg", ja: "卵" },
  milk: { en: "milk", ja: "乳" },
  soy: { en: "soy", ja: "大豆" },
  peanut: { en: "peanut", ja: "ピーナッツ" },
  treenut: { en: "tree nut", ja: "ナッツ" },
  fish: { en: "fish", ja: "魚" },
  shellfish: { en: "shellfish", ja: "甲殻類" },
  sesame: { en: "sesame", ja: "ごま" },
};

const VERDICT_STYLE: Record<
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
    bg: "bg-slate-50",
    text: "text-slate-900",
    ring: "ring-slate-300",
    label: "UNKNOWN — verify with kitchen",
  },
};

export default function Home() {
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

  const verdictStyle = result ? VERDICT_STYLE[result.verdict] : null;

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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Portfolio 02 · Realtime Allergen Decision Support
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Service-floor allergen lookup
          </h1>
          <p className="text-slate-600">
            Speak or type a question — &quot;Does the salmon teriyaki have
            shellfish?&quot; — and get a verified ○ / △ / × answer in under a
            second. AI is used only to normalise intent; the verdict comes from
            a deterministic Allergen Matrix lookup.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              disabled={!speechSupported}
              className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-all ${
                listening
                  ? "animate-pulse bg-rose-500 text-white shadow-lg shadow-rose-200"
                  : "bg-slate-900 text-white hover:bg-slate-700"
              } disabled:cursor-not-allowed disabled:bg-slate-300`}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening ? "■" : "🎙"}
            </button>
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Transcript
              </label>
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  speechSupported
                    ? "Tap the mic, or type here…"
                    : "Type your question here (mic not supported in this browser)"
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitQuery();
                }}
              />
            </div>
            <button
              type="button"
              onClick={submitQuery}
              disabled={loading || !transcript.trim()}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Checking…" : "Check"}
            </button>
          </div>
          {!speechSupported && (
            <p className="mt-3 text-xs text-slate-500">
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

        {result && verdictStyle && (
          <section
            className={`rounded-2xl border-2 p-6 shadow-sm ring-4 ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.ring} border-current/20`}
          >
            <div className="flex items-start gap-6">
              <div className="text-7xl font-bold leading-none">
                {result.verdict}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                  {verdictStyle.label}
                </p>
                {result.matchedItem && (
                  <p className="text-xl font-semibold">
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Multi-Order Safety Check
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Build a guest&apos;s order, select their allergies, get every
              dish&apos;s verdict at once. No AI call — pure table lookup,
              instant.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <fieldset className="rounded-lg border border-slate-200 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Order ({selectedItemIds.length})
              </legend>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {SAMPLE_MENU.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-2 rounded p-1 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1 accent-slate-900"
                    />
                    <span className="text-sm leading-tight">
                      {item.name.en}
                      <span className="ml-1 text-xs text-slate-500">
                        / {item.name.ja}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="rounded-lg border border-slate-200 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Allergies ({selectedAllergens.length})
              </legend>
              <div className="grid grid-cols-2 gap-1">
                {ALLERGEN_KEYS.map((a) => (
                  <label
                    key={a}
                    className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAllergens.includes(a)}
                      onChange={() => toggleAllergen(a)}
                      className="accent-slate-900"
                    />
                    <span className="text-sm capitalize">
                      {ALLERGEN_LABEL[a].en}
                      <span className="ml-1 text-xs text-slate-500">
                        / {ALLERGEN_LABEL[a].ja}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={runOrderCheck}
              disabled={!orderReady}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Check Order Safety
            </button>
            {(selectedItemIds.length > 0 ||
              selectedAllergens.length > 0 ||
              orderResult) && (
              <button
                type="button"
                onClick={clearOrder}
                className="text-xs text-slate-500 underline hover:text-slate-900"
              >
                Clear
              </button>
            )}
          </div>

          {orderResult && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {orderResult.summary.safeCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    SAFE ○
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-600">
                    {orderResult.summary.traceCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    TRACE △
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-rose-600">
                    {orderResult.summary.containsCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    CONTAINS ×
                  </div>
                </div>
              </div>

              {orderResult.items.map(({ item, cells, worstVerdict }) => {
                const style = VERDICT_STYLE[worstVerdict];
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border-l-4 p-4 ${style.bg} ${style.text}`}
                    style={{ borderLeftColor: "currentColor" }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">
                        {item.name.en}
                        <span className="ml-2 text-sm opacity-70">
                          / {item.name.ja}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                          {style.label}
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
                          className="rounded bg-white/60 p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-5 text-center text-lg font-bold">
                              {c.verdict}
                            </span>
                            <span className="font-medium capitalize">
                              {ALLERGEN_LABEL[c.allergen].en}
                            </span>
                            <span className="text-xs opacity-60">
                              / {ALLERGEN_LABEL[c.allergen].ja}
                            </span>
                          </div>
                          {c.note && (
                            <div className="mt-1 ml-7 space-y-0.5 text-xs">
                              <p>{c.note.en}</p>
                              <p className="opacity-70">{c.note.ja}</p>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Sample Allergen Matrix · {SAMPLE_MENU.length} items
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-600">
                  <th className="px-3 py-2 font-semibold">Item</th>
                  {ALLERGEN_KEYS.map((k) => (
                    <th
                      key={k}
                      className="px-2 py-2 text-center font-semibold"
                      title={ALLERGEN_LABEL[k].ja}
                    >
                      {ALLERGEN_LABEL[k].en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAMPLE_MENU.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{item.name.en}</div>
                      <div className="text-xs text-slate-500">
                        {item.name.ja}
                      </div>
                    </td>
                    {ALLERGEN_KEYS.map((k) => {
                      const level = item.contains[k];
                      const symbol =
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
                          className={`px-2 py-2 text-center font-bold ${color}`}
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

        <footer className="pb-6 text-center text-xs text-slate-500">
          Portfolio 02 · Realtime Allergen Decision Support · Next.js 16 +
          Claude Haiku 4.5 + Sheets-shaped knowledge base ·{" "}
          <a
            href="https://github.com/risicare-jp/portfolio-02-realtime-allergen"
            className="underline"
          >
            GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}
