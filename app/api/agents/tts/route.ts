import { NextRequest, NextResponse } from "next/server";
import { truncateForTts } from "@/lib/ttsClient";
import { getTtsConfig, type TtsConfig } from "@/lib/ttsVoices";

async function synthesize(
  apiKey: string,
  cfg: TtsConfig,
  voiceId: string,
  modelId: string,
  text: string
): Promise<ArrayBuffer | null> {
  const body: Record<string, unknown> = {
    text,
    model_id: modelId,
    voice_settings: cfg.voiceSettings,
  };

  if (cfg.languageCode) {
    body.language_code = cfg.languageCode;
  }

  const params = new URLSearchParams({
    output_format: cfg.outputFormat,
    optimize_streaming_latency: "4",
  });

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?${params}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("ElevenLabs TTS error:", response.status, voiceId, modelId, err);
    return null;
  }

  return response.arrayBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { text, language } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const lang = typeof language === "string" ? language : undefined;
    const truncated = truncateForTts(text);
    const cfg = getTtsConfig(lang);

    const attempts: { voiceId: string; modelId: string }[] = [
      { voiceId: cfg.voiceId, modelId: cfg.modelId },
    ];
    if (cfg.fallbackVoiceId && cfg.fallbackModelId) {
      attempts.push({
        voiceId: cfg.fallbackVoiceId,
        modelId: cfg.fallbackModelId,
      });
    }

    let audioBuffer: ArrayBuffer | null = null;

    for (const { voiceId, modelId } of attempts) {
      audioBuffer = await synthesize(apiKey, cfg, voiceId, modelId, truncated);
      if (audioBuffer) break;
    }

    if (!audioBuffer) {
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 502 }
      );
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("tts agent error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
