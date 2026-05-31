import { NextRequest, NextResponse } from "next/server";
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
    const prompt = `Rewrite this medical summary as if explaining to a worried family member with zero medical knowledge. Be warm, reassuring, and use the simplest possible words. Under 80 words.

Summary:
${summary}`;

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
