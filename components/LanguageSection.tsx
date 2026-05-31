"use client";

import { useEffect } from "react";
import { formatPlainParagraphs, stripMarkdown } from "@/lib/formatText";
import { prefetchTts } from "@/lib/ttsClient";
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

  useEffect(() => {
    if (!translation?.trim() || loading) return;
    void prefetchTts(translation, activeLanguage);
  }, [translation, activeLanguage, loading]);

  return (
    <section className="card-surface">
      <div className="section-title-row mb-5">
        <h2 className="type-section-title">In your language</h2>
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
            The Listen button reads the translation aloud with a voice matched
            to your language — Indian voices for Hindi, Tamil, Kannada,
            Malayalam, Telugu, and other regional languages (not an American
            accent).
          </p>
        </SectionInfoButton>
      </div>

      <LanguagePicker
        activeLanguage={activeLanguage}
        onSelect={onSwitch}
        disabled={loading}
      />

      {loading && !translation && (
        <p className="mt-4 text-[15px] text-text-secondary">
          Preparing translation…
        </p>
      )}

      {paragraphs.length > 0 && (
        <div className="relative mt-6">
          <div className="type-translation">
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
