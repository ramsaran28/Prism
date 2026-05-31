/** ElevenLabs voice IDs */
export const VOICE_US = "21m00Tcm4TlvDq8ikWAM"; // Rachel — American English
export const VOICE_INDIAN = "vgONzfrwOtgEB8KJXfVs"; // Priya — Indian English
export const VOICE_INDIAN_FALLBACK = "AZnzlk1XvdvUeBnXmlld"; // Domi

export const TTS_MODEL = "eleven_multilingual_v2";

export function getVoiceIdsForLanguage(language?: string): string[] {
  if (language === "English (US)") {
    return [VOICE_US];
  }
  return [VOICE_INDIAN, VOICE_INDIAN_FALLBACK];
}
