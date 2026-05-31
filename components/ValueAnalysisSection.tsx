"use client";

import { useMemo } from "react";
import type { LabValue } from "@/lib/types";
import { selectTopChartValues } from "@/lib/chartValues";
import { LabValuesChart } from "./LabValuesChart";

interface ValueAnalysisSectionProps {
  values: LabValue[];
  flaggedValues?: { name: string }[];
}

export function ValueAnalysisSection({
  values,
  flaggedValues = [],
}: ValueAnalysisSectionProps) {
  const chartValues = useMemo(
    () => selectTopChartValues(values, flaggedValues),
    [values, flaggedValues]
  );

  if (!chartValues.length) return null;

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h2 className="type-h2">Live value analysis</h2>
        <p className="mt-1 text-xs text-text-secondary">
          Your 7 most important results
        </p>
      </div>
      <div className="px-6 pb-6 pt-2">
        <LabValuesChart values={chartValues} />
      </div>
    </section>
  );
}
