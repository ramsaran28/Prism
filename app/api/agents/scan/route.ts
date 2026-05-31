import { NextRequest, NextResponse } from "next/server";
import { withPlainLanguageRules } from "@/lib/agentPrompts";
import { getFlashModel, parseJsonFromText } from "@/lib/gemini";
import type { ScanResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType } = await req.json();
    if (!base64 || !mimeType) {
      return NextResponse.json(
        { error: "base64 and mimeType are required" },
        { status: 400 }
      );
    }

    const model = getFlashModel();
    const prompt = withPlainLanguageRules(
      `Extract every lab value from this report. Return JSON only: { "values": [{ "name": string, "result": string, "unit": string, "referenceRange": string, "status": "normal"|"high"|"low" }] }. For each "name", use the plain English label from the report mapping (e.g. "Oxygen in your blood" not hemoglobin). If a value cannot be determined, omit it. No markdown.`
    );

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
    ]);

    const text = result.response.text();
    const parsed = parseJsonFromText<ScanResult>(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("scan agent error:", error);
    return NextResponse.json(
      { error: "Failed to scan report" },
      { status: 500 }
    );
  }
}
