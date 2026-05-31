import { NextRequest, NextResponse } from "next/server";
import { withPlainLanguageRules } from "@/lib/agentPrompts";
import { getLanguageLabel } from "@/lib/languages";
import { stripMarkdown } from "@/lib/formatText";
import { getFlashModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { summary, language, targetLanguage } = await req.json();
    const lang = targetLanguage ?? language;
    const text = summary ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "summary is required" },
        { status: 400 }
      );
    }

    const label = getLanguageLabel(lang);
    const model = getFlashModel();
    const prompt = withPlainLanguageRules(
      `Translate the following summary into ${label}. Keep the tone warm, simple, and caring. Do not add or remove information. Plain text only — no markdown.

Summary:
${text}`
    );

    const result = await model.generateContent(prompt);
    return NextResponse.json({
      translation: stripMarkdown(result.response.text()),
    });
  } catch (error) {
    console.error("translate agent error:", error);
    return NextResponse.json(
      { error: "Failed to translate" },
      { status: 500 }
    );
  }
}
