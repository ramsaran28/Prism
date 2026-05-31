"use client";

import { Globe } from "lucide-react";

interface AnalyzeTopBarProps {
  language: string;
}

export function AnalyzeTopBar({ language }: AnalyzeTopBarProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold tracking-tight text-text-primary">
          Saathi
        </span>
        <span className="text-accent" aria-hidden>
          ●
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Globe className="h-4 w-4 text-accent" />
        <span>{language}</span>
      </div>
      <p className="text-xs text-text-secondary sm:max-w-xs sm:text-right">
        Not medical advice. Always consult your doctor.
      </p>
    </header>
  );
}
