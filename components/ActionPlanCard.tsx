"use client";

import type { GuideResult } from "@/lib/types";

interface ActionPlanCardProps {
  guide: GuideResult | null;
}

export function ActionPlanCard({ guide }: ActionPlanCardProps) {
  if (!guide) return null;

  return (
    <section className="card-surface px-6 py-5">
      <h2 className="type-h2 mb-4">Your action plan</h2>
      <ol className="mb-6 list-decimal space-y-3 pl-5">
        {guide.steps.map((step, i) => (
          <li key={i} className="action-plan-step -mx-2 rounded-element px-2 py-1">
            {step}
          </li>
        ))}
      </ol>
      {guide.questions.length > 0 && (
        <>
          <p className="type-card-title mb-3">Questions for your doctor</p>
          <ol className="space-y-3">
            {guide.questions.map((q, i) => (
              <li key={i} className="action-plan-question">
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
