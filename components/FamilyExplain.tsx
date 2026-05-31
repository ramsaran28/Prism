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
    <section className="card-surface px-6 py-5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !summary || loading}
        className="btn-family disabled:opacity-50"
      >
        <Users className="h-4 w-4" />
        Explain to my family
      </button>
      {paragraphs.length > 0 && (
        <div className="type-summary mt-4 rounded-element border-l-[3px] border-l-accent bg-accent-muted p-5">
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
