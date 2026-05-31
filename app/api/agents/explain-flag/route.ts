import { NextRequest } from "next/server";
import { getValueLabel } from "@/lib/labValueNames";
import { getFlashModel } from "@/lib/gemini";
import type { LabValue, ValueStatus } from "@/lib/types";

function statusLabel(status: ValueStatus): string {
  if (status === "high") return "High";
  if (status === "low") return "Low";
  return "Normal";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const value: LabValue = body.value;
    const related: LabValue[] = body.relatedFlagged ?? [];

    if (!value) {
      return new Response("value is required", { status: 400 });
    }

    const plainName = getValueLabel(value);
    const relatedList = related
      .slice(0, 3)
      .map(
        (v) =>
          `${getValueLabel(v)}: ${v.result}${v.unit ? ` ${v.unit}` : ""} (${statusLabel(v.status)})`
      )
      .join("\n");

    const prompt = `A patient is looking at their lab report and wants to understand why a specific value was flagged. Explain it in warm, simple, non-scary language.

The flagged value is: ${plainName}
Their result: ${value.result}${value.unit ? ` ${value.unit}` : ""}
Normal range: ${value.referenceRange}
Status: ${statusLabel(value.status)}
Other related flagged values in their report:
${relatedList || "None"}

Write your explanation in exactly 3 short paragraphs:

Paragraph 1 (2-3 sentences):
What this value measures in plain words. What does it do in the body? Use an analogy if helpful.

Paragraph 2 (2-3 sentences):
What it means that their specific value is ${value.status === "high" ? "high" : value.status === "low" ? "low" : "outside normal"}. Be honest but calm. Mention the related values if they paint a bigger picture together.

Paragraph 3 (1-2 sentences):
What they can do about it. Always end on a hopeful, actionable note.

Rules:
- Never use medical jargon
- Never say 'consult a doctor' as the only advice
- Never be scary or alarmist
- Always be warm and reassuring
- Write as if you are a knowledgeable friend
- Maximum 120 words total`;

    const model = getFlashModel();
    const result = await model.generateContentStream(prompt);
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
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
    console.error("explain-flag agent error:", error);
    return new Response("Failed to generate explanation", { status: 500 });
  }
}
