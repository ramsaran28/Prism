export type Language = {
  code: string;
  name: string;
};

export const LANGUAGES: Language[] = [
  { code: "en-US", name: "English (US)" },
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "as", name: "Assamese" },
  { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "my", name: "Burmese" },
  { code: "ca", name: "Catalan" },
  { code: "ceb", name: "Cebuano" },
  { code: "zh-CN", name: "Chinese Simplified" },
  { code: "zh-TW", name: "Chinese Traditional" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English (UK)" },
  { code: "et", name: "Estonian" },
  { code: "fil", name: "Filipino" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "haw", name: "Hawaiian" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "ig", name: "Igbo" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "jv", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "kok", name: "Konkani" },
  { code: "ko", name: "Korean" },
  { code: "ku", name: "Kurdish" },
  { code: "ky", name: "Kyrgyz" },
  { code: "lo", name: "Lao" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Maori" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "or", name: "Odia" },
  { code: "ps", name: "Pashto" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sa", name: "Sanskrit" },
  { code: "sr", name: "Serbian" },
  { code: "sd", name: "Sindhi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "es", name: "Spanish" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "tl", name: "Tagalog" },
  { code: "tg", name: "Tajik" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "bo", name: "Tibetan" },
  { code: "tk", name: "Turkmen" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "xh", name: "Xhosa" },
  { code: "yi", name: "Yiddish" },
  { code: "yo", name: "Yoruba" },
  { code: "zu", name: "Zulu" },
  { code: "mai", name: "Maithili" },
  { code: "fj", name: "Fijian" },
  { code: "sm", name: "Samoan" },
  { code: "to", name: "Tongan" },
  { code: "dz", name: "Dzongkha" },
  { code: "fo", name: "Faroese" },
  { code: "fy", name: "Frisian" },
  { code: "gd", name: "Scottish Gaelic" },
  { code: "hmn", name: "Hmong" },
  { code: "la", name: "Latin" },
  { code: "ln", name: "Lingala" },
  { code: "lus", name: "Mizo" },
  { code: "ny", name: "Chichewa" },
  { code: "om", name: "Oromo" },
  { code: "qu", name: "Quechua" },
  { code: "sn", name: "Shona" },
  { code: "su", name: "Sundanese" },
  { code: "tt", name: "Tatar" },
  { code: "ug", name: "Uyghur" },
];

export const QUICK_LANGUAGE_PILLS = [
  "English (US)",
  "English (UK)",
  "Hindi",
  "Kannada",
  "Spanish",
  "Tamil",
  "Arabic",
  "French",
  "Bengali",
] as const;

export function getLanguageByName(name: string): Language | undefined {
  return LANGUAGES.find(
    (l) => l.name.toLowerCase() === name.toLowerCase()
  );
}

export function getLanguageLabel(codeOrLabel: string): string {
  const byCode = LANGUAGES.find((l) => l.code === codeOrLabel);
  if (byCode) return byCode.name;
  const byName = getLanguageByName(codeOrLabel);
  return byName?.name ?? codeOrLabel;
}

export function filterLanguages(query: string): Language[] {
  const q = query.trim().toLowerCase();
  if (!q) return LANGUAGES;
  return LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
  );
}

export function getQuickPillLanguages(): Language[] {
  return QUICK_LANGUAGE_PILLS.map(
    (name) => getLanguageByName(name)!
  ).filter(Boolean);
}
