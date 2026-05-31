import { stripMarkdown } from "./formatText";

/** Pause between spoken paragraphs (ElevenLabs SSML break). */
const PARAGRAPH_BREAK = '<break time="0.7s" />';
const SENTENCE_BREAK = '<break time="0.35s" />';

/**
 * Turn written translation text into phrasing that sounds natural when spoken aloud.
 */
export function prepareTextForSpeech(text: string): string {
  const plain = stripMarkdown(text)
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "";

  const paragraphs = plain
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  const source = paragraphs.length > 1 ? paragraphs : [plain];

  return source
    .map((paragraph) => {
      const sentences = paragraph
        .split(/(?<=[.!?।॥])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (sentences.length <= 1) return paragraph;
      return sentences.join(` ${SENTENCE_BREAK} `);
    })
    .join(` ${PARAGRAPH_BREAK} `);
}

/** Split long scripts at paragraph boundaries for stitched TTS requests. */
export function chunkForSpeech(text: string, maxChars = 1800): string[] {
  if (text.length <= maxChars) return [text];

  const paragraphs = text
    .split(PARAGRAPH_BREAK)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const joined = current
      ? `${current} ${PARAGRAPH_BREAK} ${para}`
      : para;

    if (joined.length > maxChars && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = joined;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

export function snippetForStitch(text: string, maxLen = 120): string {
  const flat = text.replace(/<break[^>]*\/?>/g, " ").replace(/\s+/g, " ").trim();
  if (flat.length <= maxLen) return flat;
  return flat.slice(-maxLen);
}
