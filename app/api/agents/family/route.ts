import { NextRequest, NextResponse } from "next/server";
import { withPlainLanguageRules } from "@/lib/agentPrompts";
import { getFlashModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { summary } = await req.json();
    if (!summary) {
      return NextResponse.json(
        { error: "summary is required" },
        { status: 400 }
      );
    }

    const model = getFlashModel();
    const prompt = withPlainLanguageRules(
      `Rewrite this summary for a worried family member with zero medical knowledge. Be warm and reassuring. Under 80 words.

Summary:
${summary}`
    );

    const result = await model.generateContent(prompt);
    return NextResponse.json({ familySummary: result.response.text() });
  } catch (error) {
    console.error("family agent error:", error);
    return NextResponse.json(
      { error: "Failed to generate family summary" },
      { status: 500 }
    );
  }
}
