import { NextRequest, NextResponse } from "next/server";
import { getFlashModel, parseJsonFromText } from "@/lib/gemini";
import type { RiskResult, ScanResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const values: ScanResult["values"] =
      body.values ?? body.scan?.values ?? body;

    if (!values || !Array.isArray(values)) {
      return NextResponse.json(
        { error: "values array is required" },
        { status: 400 }
      );
    }

    const model = getFlashModel();
    const prompt = `You are a medical risk assessor. Given these lab values, determine overall severity. Return JSON only: { "severity": "normal"|"moderate"|"urgent", "summary": string, "flaggedValues": [{ "name": string, "reason": string }] }. Be calm and measured — urgent only for genuinely concerning patterns.

Lab values:
${JSON.stringify(values, null, 2)}`;

    const result = await model.generateContent(prompt);
    const parsed = parseJsonFromText<RiskResult>(result.response.text());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("risk agent error:", error);
    return NextResponse.json(
      { error: "Failed to assess risk" },
      { status: 500 }
    );
  }
}
