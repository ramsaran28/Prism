"use client";

import { useMemo } from "react";
import type { LabValue } from "@/lib/types";
import { selectTopChartValues } from "@/lib/chartValues";
import { LabValuesChart } from "./LabValuesChart";
import { InfoBullet } from "./InfoBullet";
import { SectionInfoButton } from "./SectionInfoButton";

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
    <section className="card-surface overflow-hidden !p-0">
      <div className="border-b border-border px-7 py-5">
        <div className="section-title-row">
          <h2 className="type-section-title">Live value analysis</h2>
          <SectionInfoButton
            modalTitle="How to read this chart"
            ariaLabel="How to read this chart"
          >
            <p>
              This chart shows your 7 most important health values and where
              they sit compared to what&apos;s considered healthy.
            </p>
            <InfoBullet>Too Low — your value is below the healthy range</InfoBullet>
            <InfoBullet>Normal Zone — your value is right where it should be</InfoBullet>
            <InfoBullet>Too High — your value is above the healthy range</InfoBullet>
            <p>Bar colors tell you the status at a glance:</p>
            <InfoBullet color="#4ECBA8">Green bar — value is normal</InfoBullet>
            <InfoBullet color="#D4956A">Amber bar — slightly outside normal</InfoBullet>
            <InfoBullet color="#C4617A">Red bar — needs attention</InfoBullet>
            <p>
              Hover over any bar to see more detail about that specific value.
            </p>
          </SectionInfoButton>
        </div>
        <p className="type-analysis-subtitle mt-1">
          Your 7 most important results
        </p>
      </div>
      <div className="px-7 pb-6 pt-2">
        <LabValuesChart values={chartValues} allValues={values} />
      </div>
    </section>
  );
}
