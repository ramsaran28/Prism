"use client";

import { formatPlainParagraphs, stripSaathiOpener } from "@/lib/formatText";

interface SummaryCardProps {
  text: string;
  streaming: boolean;
}

export function SummaryCard({ text, streaming }: SummaryCardProps) {
  const cleaned = stripSaathiOpener(text);
  const paragraphs = formatPlainParagraphs(cleaned);

  return (
    <section className="rounded-card border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-medium text-text-primary">
        Plain language summary
      </h2>
      <div className="text-base leading-[1.8] text-text-primary/90">
        {streaming ? (
          <p className="whitespace-pre-wrap">
            {cleaned}
            <span className="cursor-blink ml-0.5 inline-block h-4 w-0.5 bg-accent align-middle" />
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
