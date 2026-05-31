import type { SeverityLevel } from "./types";

export function severityToBanner(severity: SeverityLevel | null): {
  color: "green" | "amber" | "red";
  message: string;
} | null {
  if (!severity) return null;
  switch (severity) {
    case "normal":
      return {
        color: "green",
        message:
          "Everything looks within normal range. Great news.",
      };
    case "moderate":
      return {
        color: "amber",
        message:
          "A few values need attention. Not urgent — but worth discussing with your doctor.",
      };
    case "urgent":
      return {
        color: "red",
        message:
          "Some results need prompt medical attention. Please see a doctor soon.",
      };
  }
}
