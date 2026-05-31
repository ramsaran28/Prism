import { stripMarkdown } from "@/lib/formatText";

/** Shorter text = much faster ElevenLabs synthesis */
export const TTS_MAX_CHARS = 400;

const bufferCache = new Map<string, ArrayBuffer>();
const inflight = new Map<string, Promise<ArrayBuffer>>();

export function truncateForTts(text: string, max = TTS_MAX_CHARS): string {
  const trimmed = stripMarkdown(text).trim();
  if (trimmed.length <= max) return trimmed;

  const slice = trimmed.slice(0, max);
  const breakAt = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf(".\n"),
    slice.lastIndexOf("? "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("\n")
  );

  if (breakAt > max * 0.45) {
    return slice.slice(0, breakAt + 1).trim();
  }

  return `${slice.trimEnd()}...`;
}

export function ttsCacheKey(language: string, text: string): string {
  return `${language}:${truncateForTts(text)}`;
}

export function getCachedTtsAudio(
  language: string,
  text: string
): ArrayBuffer | null {
  return bufferCache.get(ttsCacheKey(language, text)) ?? null;
}

export function isTtsCached(language: string, text: string): boolean {
  return bufferCache.has(ttsCacheKey(language, text));
}

export async function fetchTtsAudio(
  text: string,
  language: string
): Promise<ArrayBuffer> {
  const cacheKey = ttsCacheKey(language, text);
  const cached = bufferCache.get(cacheKey);
  if (cached) return cached;

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const truncated = truncateForTts(text);

  const request = (async () => {
    try {
      const res = await fetch("/api/agents/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: truncated, language }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? "TTS failed"
        );
      }

      const buffer = await res.arrayBuffer();
      bufferCache.set(cacheKey, buffer);
      return buffer;
    } finally {
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, request);
  return request;
}

export async function prefetchTts(
  text: string,
  language: string
): Promise<void> {
  if (!text.trim() || isTtsCached(language, text)) return;
  try {
    await fetchTtsAudio(text, language);
  } catch {
    /* background prefetch */
  }
}

export async function playTtsBuffer(
  buffer: ArrayBuffer,
  audioRef: { current: HTMLAudioElement | null },
  objectUrlRef: { current: string | null }
): Promise<{ stop: () => void }> {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }
  if (objectUrlRef.current) {
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }

  const blob = new Blob([buffer], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  objectUrlRef.current = url;

  const audio = new Audio(url);
  audioRef.current = audio;

  await audio.play();

  return {
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      audioRef.current = null;
    },
  };
}
