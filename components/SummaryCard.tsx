"use client";

import { formatPlainParagraphs, stripPrismOpener } from "@/lib/formatText";

interface SummaryCardProps {
  text: string;
  streaming: boolean;
}

export function SummaryCard({ text, streaming }: SummaryCardProps) {
  const cleaned = stripPrismOpener(text);
  const paragraphs = formatPlainParagraphs(cleaned);

  return (
    <section className="card-surface px-6 py-5">
      <p className="type-card-title mb-4">Plain language summary</p>
      <div className="type-summary">
        {streaming ? (
          <p className="whitespace-pre-wrap">
            {cleaned}
            <span className="cursor-blink ml-0.5 inline-block h-4 w-0.5 align-middle" />
          </p>
        ) : (
          paragraphs.map((para, i) => (
            <p key={i} className="mb-4 last:mb-0">
              {para}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
