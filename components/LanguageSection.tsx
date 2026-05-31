"use client";

import { formatPlainParagraphs, stripMarkdown } from "@/lib/formatText";
import { LanguagePicker } from "./LanguagePicker";
import { LanguageVoiceButton } from "./LanguageVoiceButton";
import { SectionInfoButton } from "./SectionInfoButton";

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
    <section className="card-surface">
      <div className="section-title-row mb-5">
        <h2 className="type-h2">In your language</h2>
        <SectionInfoButton
          modalTitle="About translations"
          ariaLabel="About translations"
        >
          <p>
            Prism can translate your health summary into 100+ languages using
            Google Gemini.
          </p>
          <p>
            The translation keeps the same warm, simple tone as the original —
            no medical jargon in any language.
          </p>
          <p>
            The Listen button reads the translation aloud using ElevenLabs voice
            technology, which supports 29 languages natively.
          </p>
          <p>
            For languages outside those 29, the voice will read in the closest
            supported language.
          </p>
        </SectionInfoButton>
      </div>

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
