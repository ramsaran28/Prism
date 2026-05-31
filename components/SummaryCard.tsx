"use client";

import { formatPlainParagraphs, stripPrismOpener } from "@/lib/formatText";
import { SectionInfoButton } from "./SectionInfoButton";

interface SummaryCardProps {
  text: string;
  streaming: boolean;
}

export function SummaryCard({ text, streaming }: SummaryCardProps) {
  const cleaned = stripPrismOpener(text);
  const paragraphs = formatPlainParagraphs(cleaned);

  if (!cleaned && !streaming) return null;

  return (
    <section className="card-surface">
      <div className="section-title-row mb-5">
        <h2 className="type-h2">Plain language summary</h2>
        <SectionInfoButton
          modalTitle="About this summary"
          ariaLabel="About this summary"
        >
          <p>
            This summary is written by Prism in plain, everyday language — no
            medical jargon.
          </p>
          <p>
            It always starts with what looks good, then honestly explains
            anything that needs attention.
          </p>
          <p>
            The goal is to help you understand your results before your next
            doctor&apos;s visit — not to replace that visit.
          </p>
          <p>
            If anything in the summary worries you, please speak with a
            qualified doctor.
          </p>
        </SectionInfoButton>
      </div>
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
