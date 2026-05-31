"use client";

import type { GuideResult } from "@/lib/types";
import { SectionInfoButton } from "./SectionInfoButton";

interface ActionPlanCardProps {
  guide: GuideResult | null;
}

export function ActionPlanCard({ guide }: ActionPlanCardProps) {
  if (!guide) return null;

  return (
    <section className="card-surface">
      <div className="section-title-row mb-5">
        <h2 className="type-h2">Your action plan</h2>
        <SectionInfoButton
          modalTitle="About your action plan"
          ariaLabel="About your action plan"
        >
          <p>
            Your action plan gives you simple, practical steps based on your
            specific results.
          </p>
          <p>
            These are gentle suggestions — things like dietary changes,
            supplements to discuss with your doctor, or lifestyle adjustments.
          </p>
          <p>
            The questions at the bottom are designed to help you have a better
            conversation at your next appointment. Print them or screenshot them
            to bring along.
          </p>
          <p>
            Always follow your doctor&apos;s advice over anything shown here.
          </p>
        </SectionInfoButton>
      </div>
      <div className="mb-6">
        {guide.steps.map((step, i) => (
          <div key={i} className="action-plan-step">
            {step}
          </div>
        ))}
      </div>
      {guide.questions.length > 0 && (
        <>
          <p className="type-card-title mb-3">Questions for your doctor</p>
          <div>
            {guide.questions.map((q, i) => (
              <div key={i} className="action-plan-question">
                <span className="mr-2 font-medium text-info">{i + 1}.</span>
                {q}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
