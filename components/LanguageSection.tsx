"use client";

import { formatPlainParagraphs, stripMarkdown } from "@/lib/formatText";
import { LanguagePicker } from "./LanguagePicker";
import { LanguageVoiceButton } from "./LanguageVoiceButton";

interface LanguageSectionProps {
  translation: string | null;
  activeLanguage: string;
  onSwitch: (language: string) => void;
  loading?: boolean;
}

export function LanguageSection({
  translation,
  activeLanguage,
  onSwitch,
  loading,
}: LanguageSectionProps) {
  const paragraphs = translation
    ? formatPlainParagraphs(stripMarkdown(translation))
    : [];

  const showVoice = Boolean(translation?.trim() && !loading);

  return (
    <section className="card-surface px-6 py-5">
      <h2 className="type-h2 mb-4">In your language</h2>

      <LanguagePicker
        activeLanguage={activeLanguage}
        onSelect={onSwitch}
        disabled={loading}
      />

      {loading && !translation && (
        <p className="mt-4 text-sm text-text-secondary">
          Preparing translation…
        </p>
      )}

      {paragraphs.length > 0 && (
        <div className="relative mt-6">
          <div className="type-summary">
            {paragraphs.map((para, i) => (
              <p key={i} className="mb-4 last:mb-0">
                {para}
              </p>
            ))}
          </div>
          {showVoice && (
            <div className="mt-4 flex justify-end">
              <LanguageVoiceButton
                translatedText={translation!}
                language={activeLanguage}
                languageKey={`${activeLanguage}-${translation}`}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
