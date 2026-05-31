import { NextRequest, NextResponse } from "next/server";
import { withPlainLanguageRules } from "@/lib/agentPrompts";
import { toPlainEnglishName } from "@/lib/labValueNames";
import { getFlashModel, parseJsonFromText } from "@/lib/gemini";
import type { GuideResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { flaggedValues, risk, severity } = await req.json();
    const flagged = (flaggedValues ?? risk?.flaggedValues ?? []).map(
      (f: { name: string; reason: string }) => ({
        name: toPlainEnglishName(f.name),
        reason: f.reason,
      })
    );

    const model = getFlashModel();
    const prompt = withPlainLanguageRules(
      `Based on these results, write 3–5 gentle action steps and 3 simple questions to ask a doctor. Return JSON only: { "steps": string[], "questions": string[] }.

Severity: ${severity ?? risk?.severity ?? "unknown"}
Flagged results:
${JSON.stringify(flagged, null, 2)}`
    );

    const result = await model.generateContent(prompt);
    const parsed = parseJsonFromText<GuideResult>(result.response.text());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("guide agent error:", error);
    return NextResponse.json(
      { error: "Failed to generate guide" },
      { status: 500 }
    );
  }
}
