import { NextRequest, NextResponse } from "next/server";
import { getFlashModel, parseJsonFromText } from "@/lib/gemini";
import type { GuideResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { flaggedValues, risk, severity } = await req.json();

    const model = getFlashModel();
    const prompt = `You are a caring medical guide. Based on these lab results, generate 3-5 specific, gentle action steps the patient should take. Write as friendly guidance. Also generate 3 questions they should ask their doctor. Return JSON only: { "steps": string[], "questions": string[] }.

Severity: ${severity ?? risk?.severity ?? "unknown"}
Flagged values:
${JSON.stringify(flaggedValues ?? risk?.flaggedValues ?? [], null, 2)}`;

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
