"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { stripMarkdown } from "@/lib/formatText";

interface LanguageVoiceButtonProps {
  translatedText: string;
  /** Active language name — selects Rachel (US) vs Priya (Indian) */
  language: string;
  /** Changes when user picks a new language — resets playback */
  languageKey: string;
}

export function LanguageVoiceButton({
  translatedText,
  language,
  languageKey,
}: LanguageVoiceButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheKeyRef = useRef("");
  const cacheAudioRef = useRef("");

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const speakText = stripMarkdown(translatedText).trim();

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    stopPlayback();
    setLoading(false);
    cacheKeyRef.current = "";
    cacheAudioRef.current = "";
  }, [languageKey, speakText, stopPlayback]);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  async function fetchAudio(): Promise<string> {
    const cacheKey = `${language}:${speakText}`;
    if (cacheKeyRef.current === cacheKey && cacheAudioRef.current) {
      return cacheAudioRef.current;
    }

    const res = await fetch("/api/agents/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: speakText, language }),
    });

    const data = await res.json();
    if (!res.ok || !data.audio) {
      throw new Error(data.error ?? "TTS failed");
    }

    cacheKeyRef.current = cacheKey;
    cacheAudioRef.current = data.audio;
    return data.audio;
  }

  async function handleClick() {
    if (!speakText || loading) return;

    if (playing) {
      stopPlayback();
      return;
    }

    setLoading(true);
    try {
      const base64 = await fetchAudio();
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => setPlaying(false);
      await audio.play();
      setPlaying(true);
    } catch {
      stopPlayback();
    } finally {
      setLoading(false);
    }
  }

  let label = "▶ Listen";
  if (loading) label = "⟳ Loading...";
  if (playing) label = "⏸ Stop";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="btn-listen disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
}
