"use client";

import { AlertCircle } from "lucide-react";
import type { SeverityLevel } from "@/lib/types";
import { severityToBanner } from "@/lib/severity";

interface SeverityBannerProps {
  severity: SeverityLevel | null;
}

export function SeverityBanner({ severity }: SeverityBannerProps) {
  const banner = severityToBanner(severity);
  if (!banner) return null;

  const styles = {
    green: {
      border: "0.5px solid #4ECBA830",
      background: "#4ECBA808",
      color: "#4ECBA8",
    },
    amber: {
      border: "0.5px solid #D4956A30",
      background: "#D4956A08",
      color: "#D4956A",
    },
    red: {
      border: "0.5px solid #C4617A30",
      background: "#C4617A08",
      color: "#C4617A",
    },
  };

  const s = styles[banner.color];

  return (
    <div
      className="severity-banner mb-5"
      style={{
        border: s.border,
        background: s.background,
        color: s.color,
      }}
      role="status"
    >
      <AlertCircle className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
      <p className="flex-1">{banner.message}</p>
    </div>
  );
}
