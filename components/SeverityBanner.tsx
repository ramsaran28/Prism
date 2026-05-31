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
    green:
      "border-accent/40 bg-accent/10 text-accent py-4 px-6 text-sm md:text-base",
    amber:
      "border-warning/40 bg-warning/10 text-warning py-4 px-5 text-[15px]",
    red: "border-danger/40 bg-danger/10 text-danger py-4 px-6 text-sm md:text-base",
  };

  const isAmber = banner.color === "amber";

  return (
    <div
      className={`flex items-center gap-3 rounded-card border ${styles[banner.color]}`}
      role="status"
    >
      <AlertCircle className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
      <p className={`flex-1 leading-relaxed ${isAmber ? "" : "text-center sm:text-left"}`}>
        {banner.message}
      </p>
    </div>
  );
}
