"use client";

import { LANGUAGES } from "@/lib/languages";

interface LanguageSelectorProps {
  value: string;
  onChange: (label: string) => void;
  className?: string;
}

export function LanguageSelector({
  value,
  onChange,
  className = "",
}: LanguageSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor="language" className="text-sm text-text-secondary">
        Choose your language
      </label>
      <select
        id="language"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs rounded-element border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-accent"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.label}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
