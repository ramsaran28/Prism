import { NextRequest, NextResponse } from "next/server";
import { valuesWithPlainNames } from "@/lib/labValueNames";
import { getFlashModel, parseJsonFromText } from "@/lib/gemini";
import type { LabValue, RiskResult, ScoreResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const values: LabValue[] = body.values ?? [];
    const riskData: RiskResult = body.riskData ?? body.risk ?? {};

    if (!Array.isArray(values)) {
      return NextResponse.json(
        { error: "values array is required" },
        { status: 400 }
      );
    }

    const plainValues = valuesWithPlainNames(values);
    const model = getFlashModel();
    const prompt = `You are a medical scoring system. Based on these lab results, 
calculate an overall health score out of 100.

Break it into exactly 4 categories, each out of 25:
- Heart health (lipids, cholesterol, hs-CRP, blood pressure markers)
- Metabolic health (glucose, HbA1c, insulin, thyroid)
- Nutritional health (iron, ferritin, vitamins, minerals)
- Organ health (liver enzymes, kidney function, eGFR)

If a category has no data in the report, score it 20/25 (assume average).

Scoring rules:
- All values normal = 23-25
- 1 mildly flagged value = 18-22
- 2+ flagged values = 12-17
- Critical flags = 5-11
- Multiple critical flags = 0-4 (never give 0, minimum 3)

Return ONLY this exact JSON, nothing else:
{
  "totalScore": number,
  "categories": [
    { 
      "name": "Heart health",
      "score": number,
      "maxScore": 25,
      "status": "good" | "fair" | "needs attention",
      "oneLineNote": string (plain English, warm, max 8 words)
    },
    {
      "name": "Metabolic health", 
      "score": number,
      "maxScore": 25,
      "status": "good" | "fair" | "needs attention",
      "oneLineNote": string
    },
    {
      "name": "Nutritional health",
      "score": number, 
      "maxScore": 25,
      "status": "good" | "fair" | "needs attention",
      "oneLineNote": string
    },
    {
      "name": "Organ health",
      "score": number,
      "maxScore": 25,
      "status": "good" | "fair" | "needs attention",
      "oneLineNote": string
    }
  ],
  "encouragingMessage": string (one warm sentence, 
    always positive and forward-looking,
    never scary, max 15 words)
}

Lab results:
${JSON.stringify(plainValues, null, 2)}

Risk assessment:
${JSON.stringify(riskData, null, 2)}`;

    const result = await model.generateContent(prompt);
    const parsed = parseJsonFromText<ScoreResult>(result.response.text());

    if (parsed.totalScore < 3) {
      parsed.totalScore = 3;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("score agent error:", error);
    return NextResponse.json(
      { error: "Failed to calculate health score" },
      { status: 500 }
    );
  }
}
