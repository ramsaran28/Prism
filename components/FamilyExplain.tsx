"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { formatPlainParagraphs, stripMarkdown } from "@/lib/formatText";
import { SectionInfoButton } from "./SectionInfoButton";

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
    <section className="card-surface">
      <div className="flex w-full items-center">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || !summary || loading}
          className="btn-family min-w-0 flex-1 !w-auto disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          Explain to my family
        </button>
        <SectionInfoButton
          modalTitle="What is the family summary?"
          ariaLabel="What is the family summary?"
        >
          <p>
            The family summary rewrites your results in the simplest possible
            words — as if explaining to someone with no medical background at
            all.
          </p>
          <p>
            It&apos;s designed to be screenshot and sent to a parent, partner,
            or family member who wants to understand what&apos;s going on
            without getting overwhelmed.
          </p>
          <p>
            It keeps only the most important points and always ends on an
            encouraging note.
          </p>
        </SectionInfoButton>
      </div>
      {paragraphs.length > 0 && (
        <div className="type-translation mt-4 rounded-element border-l-[3px] border-l-accent bg-accent-muted p-5">
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
