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
      border: "0.5px solid #00C89630",
      background: "#00C89608",
      color: "#00C896",
    },
    amber: {
      border: "0.5px solid #F0A50030",
      background: "#F0A50008",
      color: "#F0A500",
    },
    red: {
      border: "0.5px solid #F0406030",
      background: "#F0406008",
      color: "#F04060",
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
        fontSize: 14,
      }}
      role="status"
    >
      <AlertCircle className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
      <p className="flex-1">{banner.message}</p>
    </div>
  );
}
