import { NextRequest } from "next/server";
import { getProModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { values, risk } = await req.json();

    const model = getProModel();
    const prompt = `You are Saathi — a warm, caring medical companion. Explain these lab results to someone with no medical background. Do NOT introduce yourself. Never say "Hello" or "I'm Saathi". Start immediately with what is good. Be honest but calm about anything concerning. Use simple words. Never use jargon or markdown formatting. Write in second person ('Your hemoglobin...'). Use plain paragraphs only. Keep it under 150 words.

Lab values:
${JSON.stringify(values ?? [], null, 2)}

Risk assessment:
${JSON.stringify(risk ?? {}, null, 2)}`;

    const result = await model.generateContentStream(prompt);
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
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
