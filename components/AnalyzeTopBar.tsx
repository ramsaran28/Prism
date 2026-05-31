"use client";

import { ThemeToggle } from "./ThemeToggle";

export function AnalyzeTopBar() {
  return (
    <header
      className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-sidebar"
      style={{ height: 56, padding: "0 28px" }}
    >
      <p className="text-[17px] font-medium text-text-primary md:block">
        Health Analysis
      </p>

      <div className="flex items-center gap-3 sm:gap-4">
        <p className="hidden max-w-md text-right text-[13px] text-text-tertiary lg:block">
          Not medical advice. Always consult your doctor.
        </p>
        <ThemeToggle />
      </div>
    </header>
  );
}
