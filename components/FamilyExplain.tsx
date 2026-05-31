"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { formatPlainParagraphs, stripMarkdown } from "@/lib/formatText";

interface FamilyExplainProps {
  summary: string;
  disabled?: boolean;
}

export function FamilyExplain({ summary, disabled }: FamilyExplainProps) {
  const [familyText, setFamilyText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!summary || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agents/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const data = await res.json();
      if (data.familySummary) {
        setFamilyText(stripMarkdown(data.familySummary));
      }
    } catch {
      setFamilyText(
        "We could not prepare a family summary right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const paragraphs = familyText ? formatPlainParagraphs(familyText) : [];

  return (
    <section className="rounded-card border border-border bg-card p-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !summary || loading}
        className="flex w-full items-center justify-center gap-2 rounded-element border border-accent/50 bg-accent/10 px-4 py-3 text-sm font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
      >
        <Users className="h-4 w-4" />
        Explain to my family
      </button>
      {paragraphs.length > 0 && (
        <div
          className="mt-4 rounded-element border-l-[3px] border-l-accent bg-[#0d1f18] p-5 text-base leading-[1.8] text-text-primary/90"
        >
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
