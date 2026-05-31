import { NextRequest, NextResponse } from "next/server";
import { getFlashModel } from "@/lib/gemini";
import { getLanguageLabel } from "@/lib/languages";
import { stripMarkdown } from "@/lib/formatText";

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
    const prompt = `Translate the following medical summary into ${label}. Keep the tone warm, simple, and caring. Do not add or remove any medical information. Use plain text only — no markdown, no asterisks, no headings, no bullet symbols.

Summary:
${text}`;

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
