"use client";

import { QUICK_LANGUAGE_PILLS } from "@/lib/languages";
import { formatPlainParagraphs, stripMarkdown } from "@/lib/formatText";

interface LanguageSectionProps {
  translation: string | null;
  activeLanguage: string;
  selectedLanguage: string;
  onSwitch: (language: string) => void;
  loading?: boolean;
}

export function LanguageSection({
  translation,
  activeLanguage,
  selectedLanguage,
  onSwitch,
  loading,
}: LanguageSectionProps) {
  const pills = Array.from(
    new Set([...QUICK_LANGUAGE_PILLS, selectedLanguage])
  );

  const paragraphs = translation
    ? formatPlainParagraphs(stripMarkdown(translation))
    : [];

  return (
    <section className="rounded-card border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-medium text-text-primary">
        In your language
      </h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {pills.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onSwitch(lang)}
            disabled={loading}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeLanguage === lang
                ? "bg-accent text-background"
                : "border border-border bg-card text-text-secondary hover:border-accent/50"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      {loading && !translation && (
        <p className="text-sm text-text-secondary">Preparing translation…</p>
      )}
      {paragraphs.length > 0 && (
        <div className="text-base leading-[1.8] text-text-primary/90">
          {paragraphs.map((para, i) => (
            <p key={i} className="mb-4 last:mb-0">
              {para}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
