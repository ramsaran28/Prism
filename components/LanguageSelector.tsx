"use client";

import { LanguagePicker } from "./LanguagePicker";

interface LanguageSelectorProps {
  value: string;
  onChange: (name: string) => void;
  className?: string;
}

export function LanguageSelector({
  value,
  onChange,
  className = "",
}: LanguageSelectorProps) {
  return (
    <div className={`flex w-full max-w-md justify-center ${className}`}>
      <LanguagePicker
        variant="landing"
        activeLanguage={value}
        onSelect={onChange}
      />
    </div>
  );
}
