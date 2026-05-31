"use client";

import { PrismLogo } from "./PrismLogo";

export function AnalyzeTopBar() {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <PrismLogo />
      <p className="text-xs text-text-secondary sm:text-right">
        Not medical advice. Always consult your doctor.
      </p>
    </header>
  );
}
