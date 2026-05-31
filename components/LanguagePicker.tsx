"use client";

import { useEffect, useRef, useState } from "react";
import {
  filterLanguages,
  getLanguageByName,
  getQuickPillLanguages,
  type Language,
} from "@/lib/languages";

interface LanguagePickerProps {
  activeLanguage: string;
  onSelect: (languageName: string) => void;
  disabled?: boolean;
  /** Landing: search + badge only. Analyze: quick pills + search. */
  variant?: "landing" | "analyze";
}

export function LanguagePicker({
  activeLanguage,
  onSelect,
  disabled,
  variant = "analyze",
}: LanguagePickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const quickPills =
    variant === "analyze" ? getQuickPillLanguages() : [];
  const filtered = filterLanguages(query);
  const active = getLanguageByName(activeLanguage);

  const placeholder =
    variant === "landing"
      ? "Search your language..."
      : "Search 100+ languages...";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        if (variant === "landing") setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  function selectLanguage(lang: Language) {
    onSelect(lang.name);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      {quickPills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickPills.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={disabled}
              onClick={() => selectLanguage(lang)}
              className={`lang-pill ${
                activeLanguage === lang.name ? "lang-pill-active" : ""
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className={
          variant === "landing"
            ? "flex flex-wrap items-center gap-2"
            : "relative"
        }
      >
        <div className={variant === "landing" ? "relative min-w-[220px] flex-1" : "relative"}>
          <input
            type="text"
            value={variant === "landing" ? query : open ? query : active?.name ?? ""}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              if (variant === "analyze") setQuery("");
            }}
            disabled={disabled}
            placeholder={placeholder}
            className="input-field w-full px-3 py-2 outline-none placeholder:text-text-secondary"
          />
          {open && (
            <ul
              className="absolute z-20 mt-1 max-h-[200px] w-full overflow-y-auto rounded-element border border-border bg-overlay py-1 shadow-lg"
              role="listbox"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-[15px] text-text-secondary">
                  No languages found
                </li>
              ) : (
                filtered.map((lang) => (
                  <li
                    key={lang.code}
                    role="option"
                    aria-selected={activeLanguage === lang.name}
                  >
                    <button
                      type="button"
                      onClick={() => selectLanguage(lang)}
                      className={`flex w-full px-3 py-2 text-left text-[15px] transition hover:bg-card-hover ${
                        activeLanguage === lang.name
                          ? "bg-accent-muted text-accent"
                          : "text-text-primary"
                      }`}
                    >
                      {lang.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {variant === "landing" && active && !open && (
          <span className="badge-normal shrink-0">
            {active.name}
          </span>
        )}
      </div>
    </div>
  );
}
