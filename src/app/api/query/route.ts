import { NextResponse } from "next/server";
import { normaliseIntent } from "@/lib/claude";
import { lookupVerdict } from "@/lib/lookup";

export async function POST(request: Request) {
  let transcript: string;
  try {
    const body = (await request.json()) as { transcript?: unknown };
    if (typeof body.transcript !== "string" || body.transcript.trim() === "") {
      return NextResponse.json(
        { error: "transcript is required" },
        { status: 400 },
      );
    }
    transcript = body.transcript.trim();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  try {
    const intent = await normaliseIntent(transcript);
    const result = lookupVerdict(intent, transcript);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    console.error("[/api/query] failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
