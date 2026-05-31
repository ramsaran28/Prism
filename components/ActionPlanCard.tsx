"use client";

import type { GuideResult } from "@/lib/types";

interface ActionPlanCardProps {
  guide: GuideResult | null;
}

export function ActionPlanCard({ guide }: ActionPlanCardProps) {
  if (!guide) return null;

  return (
    <section className="rounded-card border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-medium text-text-primary">
        Your action plan
      </h2>
      <ol className="mb-6 list-decimal space-y-3 pl-5 text-text-primary/90">
        {guide.steps.map((step, i) => (
          <li key={i} className="leading-relaxed">
            {step}
          </li>
        ))}
      </ol>
      {guide.questions.length > 0 && (
        <>
          <h3 className="mb-3 text-sm font-medium text-text-secondary">
            Questions for your doctor
          </h3>
          <ol className="space-y-3">
            {guide.questions.map((q, i) => (
              <li
                key={i}
                className="list-none rounded-element border border-border border-l-2 border-l-accent bg-card/80 p-3 text-sm leading-relaxed text-text-primary/90"
              >
                <span className="mr-2 font-medium text-accent">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
