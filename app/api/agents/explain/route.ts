import { NextRequest } from "next/server";
import { withPlainLanguageRules } from "@/lib/agentPrompts";
import { stripMarkdown } from "@/lib/formatText";
import { valuesWithPlainNames } from "@/lib/labValueNames";
import { getProModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { values, risk } = await req.json();
    const plainValues = valuesWithPlainNames(values ?? []);

    const model = getProModel();
    const prompt = withPlainLanguageRules(
      `You are Prism — a warm, caring companion. Explain these results to someone with no medical background. You may think of yourself as Prism but do NOT introduce yourself. Never open with "Hello" or "I'm Prism". Start with what looks good. Be honest but calm about anything concerning. Write in second person. Plain paragraphs only. Under 150 words.

Results:
${JSON.stringify(plainValues, null, 2)}

Risk assessment:
${JSON.stringify(risk ?? {}, null, 2)}`
    );

    const result = await model.generateContent(prompt);
    const summary = stripMarkdown(result.response.text() ?? "");

    return new Response(summary, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("explain agent error:", error);
    return new Response("Failed to generate explanation", { status: 500 });
  }
}
