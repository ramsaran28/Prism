"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { stripMarkdown } from "@/lib/formatText";
import {
  fetchTtsAudio,
  getCachedTtsAudio,
  playTtsBuffer,
  prefetchTts,
} from "@/lib/ttsClient";

interface LanguageVoiceButtonProps {
  translatedText: string;
  language: string;
  languageKey: string;
}

export function LanguageVoiceButton({
  translatedText,
  language,
  languageKey,
}: LanguageVoiceButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const stopPlaybackRef = useRef<(() => void) | null>(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const speakText = stripMarkdown(translatedText).trim();

  const stopPlayback = useCallback(() => {
    stopPlaybackRef.current?.();
    stopPlaybackRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    stopPlayback();
    setLoading(false);
  }, [languageKey, speakText, language, stopPlayback]);

  useEffect(() => {
    if (!speakText) return;
    void prefetchTts(speakText, language);
  }, [speakText, language, languageKey]);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  async function handleClick() {
    if (!speakText) return;

    if (playing) {
      stopPlayback();
      return;
    }

    const cached = getCachedTtsAudio(language, speakText);
    if (!cached) setLoading(true);

    try {
      const buffer = cached ?? (await fetchTtsAudio(speakText, language));

      stopPlaybackRef.current?.();
      const { stop } = await playTtsBuffer(buffer, audioRef, objectUrlRef);
      stopPlaybackRef.current = stop;
      setPlaying(true);
    } catch {
      stopPlayback();
    } finally {
      setLoading(false);
    }
  }

  let label = "▶ Listen";
  if (loading) label = "Loading...";
  else if (playing) label = "⏸ Stop";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !speakText}
      className="btn-listen inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      )}
      {label}
    </button>
  );
}
