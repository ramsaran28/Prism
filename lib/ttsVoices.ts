import { getLanguageByName } from "./languages";

/** American English — Rachel */
export const VOICE_US = "21m00Tcm4TlvDq8ikWAM";

/** British English — Charlotte */
export const VOICE_UK = "XB0fDUnXU5powFXDhCwa";

/** Raju — Indian male */
export const VOICE_RAJU = "3gsg3cxXyFLcGIfNbM6C";

/** Monika Sogam — Indian female */
export const VOICE_MONIKA = "1qEiC6qsybMkmnNdVMbK";

/** Damodar — Tamil male */
export const VOICE_DAMODAR = "5klqvwuBHYwcS99jLmDR";

/** Fastest ElevenLabs models (flash > turbo > multilingual) */
export const TTS_MODEL_FLASH = "eleven_flash_v2_5";
export const TTS_MODEL_TURBO = "eleven_turbo_v2_5";
export const TTS_MODEL_MULTILINGUAL = "eleven_multilingual_v2";

/** Smaller file = faster download + decode */
export const TTS_OUTPUT_FORMAT = "mp3_22050_32";

export interface TtsVoiceSettings {
  stability: number;
  similarity_boost: number;
  use_speaker_boost: boolean;
  style?: number;
}

export interface TtsConfig {
  voiceId: string;
  fallbackVoiceId?: string;
  modelId: string;
  fallbackModelId?: string;
  languageCode: string | null;
  outputFormat: string;
  voiceSettings: TtsVoiceSettings;
}

const FAST_VOICE_SETTINGS: TtsVoiceSettings = {
  stability: 0.35,
  similarity_boost: 0.5,
  style: 0,
  use_speaker_boost: false,
};

function baseConfig(
  voiceId: string,
  modelId: string,
  languageCode: string | null,
  fallback?: { voiceId?: string; modelId?: string }
): TtsConfig {
  return {
    voiceId,
    fallbackVoiceId: fallback?.voiceId,
    modelId,
    fallbackModelId: fallback?.modelId ?? TTS_MODEL_TURBO,
    languageCode,
    outputFormat: TTS_OUTPUT_FORMAT,
    voiceSettings: FAST_VOICE_SETTINGS,
  };
}

export function getTtsConfig(language?: string): TtsConfig {
  const name = language?.trim() ?? "";
  const entry = getLanguageByName(name);
  const code = entry?.code ?? "";

  if (name === "English (US)" || code === "en-US") {
    return baseConfig(VOICE_US, TTS_MODEL_FLASH, "en");
  }

  if (name === "English (UK)" || code === "en") {
    return baseConfig(VOICE_UK, TTS_MODEL_FLASH, "en", { voiceId: VOICE_US });
  }

  if (name === "Tamil" || code === "ta") {
    return baseConfig(VOICE_DAMODAR, TTS_MODEL_FLASH, "ta", {
      voiceId: VOICE_RAJU,
    });
  }

  if (name === "Hindi" || code === "hi") {
    return baseConfig(VOICE_MONIKA, TTS_MODEL_FLASH, "hi", {
      voiceId: VOICE_RAJU,
    });
  }

  if (name === "Kannada" || name === "Malayalam" || name === "Telugu") {
    const voice = name === "Malayalam" ? VOICE_MONIKA : VOICE_RAJU;
    return baseConfig(voice, TTS_MODEL_FLASH, null, {
      voiceId: VOICE_MONIKA,
      modelId: TTS_MODEL_MULTILINGUAL,
    });
  }

  if (code === "kn" || code === "ml" || code === "te") {
    const voice = code === "ml" ? VOICE_MONIKA : VOICE_RAJU;
    return baseConfig(voice, TTS_MODEL_FLASH, null, {
      voiceId: VOICE_MONIKA,
      modelId: TTS_MODEL_MULTILINGUAL,
    });
  }

  if (name && name !== "English (US)" && name !== "English (UK)") {
    return baseConfig(VOICE_RAJU, TTS_MODEL_FLASH, null, {
      voiceId: VOICE_MONIKA,
      modelId: TTS_MODEL_MULTILINGUAL,
    });
  }

  return baseConfig(VOICE_US, TTS_MODEL_FLASH, "en");
}

export function getVoiceIdsForLanguage(language?: string): string[] {
  const c = getTtsConfig(language);
  return c.fallbackVoiceId ? [c.voiceId, c.fallbackVoiceId] : [c.voiceId];
}
