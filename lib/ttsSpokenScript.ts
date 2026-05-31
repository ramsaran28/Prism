import { getLanguageLabel } from "./languages";
import { getFlashModel } from "./gemini";

/**
 * Rewrite written health text as natural spoken words in the target language.
 * Keeps facts accurate but sounds like a friend explaining out loud.
 */
export async function rewriteToSpokenScript(
  text: string,
  language: string
): Promise<string> {
  const label = getLanguageLabel(language);
  const model = getFlashModel();

  const prompt = `You are preparing a health summary to be read aloud by a voice assistant.

Rewrite the text below in ${label} so it sounds like a warm, caring person SPEAKING naturally — not reading a document.

Rules:
- Write exactly in ${label} (native script, not transliteration)
- Use short, flowing sentences that sound good when spoken aloud
- Use natural spoken connectors in ${label} (like "so", "also", "look" — or their natural equivalents)
- Start conversationally if needed (e.g. a brief friendly opener, then explain)
- NO bullet points, numbered lists, headers, markdown, or labels like "Summary:"
- NO robotic phrasing like "The following values are..." or "It is noted that..."
- Keep every medical fact accurate — do not add or remove information
- Aim for how a knowledgeable friend would explain this sitting next to someone
- Plain text only — output nothing except the spoken script

Text to rewrite:
${text}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
