"use client";

import type { LabValue } from "@/lib/types";
import { LabValuesChart } from "./LabValuesChart";

interface ValueAnalysisSectionProps {
  values: LabValue[];
}

export function ValueAnalysisSection({ values }: ValueAnalysisSectionProps) {
  if (!values.length) return null;

  return (
    <section className="rounded-card border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-medium text-text-primary">
          Live value analysis
        </h2>
      </div>
      <div className="p-6">
        <LabValuesChart values={values} />
      </div>
    </section>
  );
}
