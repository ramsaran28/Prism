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
    green: "border-accent-border bg-success-muted text-accent",
    amber: "border-warning/30 bg-warning-muted text-warning",
    red: "border-danger/30 bg-danger-muted text-danger",
  };

  return (
    <div
      className={`severity-banner ${styles[banner.color]}`}
      role="status"
    >
      <AlertCircle className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
      <p className="flex-1">{banner.message}</p>
    </div>
  );
}
