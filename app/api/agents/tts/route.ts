import { NextRequest, NextResponse } from "next/server";
import {
  getVoiceIdsForLanguage,
  TTS_MODEL,
} from "@/lib/ttsVoices";

async function synthesize(
  apiKey: string,
  voiceId: string,
  text: string
): Promise<Response> {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: TTS_MODEL,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );
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

    const voiceIds = getVoiceIdsForLanguage(
      typeof language === "string" ? language : undefined
    );

    let lastError = "";
    for (const voiceId of voiceIds) {
      const response = await synthesize(apiKey, voiceId, text);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        return NextResponse.json({ audio: base64 });
      }
      lastError = await response.text();
      console.error("ElevenLabs TTS error:", response.status, voiceId, lastError);
    }

    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 502 }
    );
  } catch (error) {
    console.error("tts agent error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
