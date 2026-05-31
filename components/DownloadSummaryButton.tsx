"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  generateHealthSummaryPdf,
  type HealthSummaryPdfInput,
} from "@/lib/generateHealthSummaryPdf";
import type {
  GuideResult,
  ScoreResult,
  SeverityLevel,
} from "@/lib/types";

interface DownloadSummaryButtonProps {
  healthScore: ScoreResult | null;
  summary: string;
  guide: GuideResult | null;
  severity: SeverityLevel | null;
  agentsReady?: boolean;
  disabled?: boolean;
}

function snapshotPdfInput(
  healthScore: ScoreResult,
  summary: string,
  guide: GuideResult | null,
  severity: SeverityLevel | null
): HealthSummaryPdfInput {
  return {
    healthScore: structuredClone(healthScore),
    summary,
    guide: guide ? structuredClone(guide) : null,
    severity,
  };
}

export function DownloadSummaryButton({
  healthScore,
  summary,
  guide,
  severity,
  agentsReady = true,
  disabled,
}: DownloadSummaryButtonProps) {
  const [generating, setGenerating] = useState(false);

  const canDownload =
    agentsReady &&
    Boolean(healthScore) &&
    Boolean(summary.trim()) &&
    !disabled &&
    !generating;

  function handleDownload() {
    if (!healthScore || !summary.trim() || !agentsReady || generating) return;

    setGenerating(true);
    try {
      generateHealthSummaryPdf(
        snapshotPdfInput(healthScore, summary, guide, severity)
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!canDownload}
      className="btn-download-summary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download
        className="h-[18px] w-[18px] shrink-0 text-[#191B22]"
        strokeWidth={2}
        aria-hidden
      />
      {generating ? "Generating..." : "Download summary"}
    </button>
  );
}
