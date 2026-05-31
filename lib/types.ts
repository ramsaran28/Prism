export type ValueStatus = "normal" | "high" | "low";

export interface LabValue {
  /** Display name (plain English when set after scan). */
  name: string;
  /** Original report label when different from `name`. */
  medicalName?: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: ValueStatus;
}

export interface ScanResult {
  values: LabValue[];
}

export type SeverityLevel = "normal" | "moderate" | "urgent";

export interface RiskResult {
  severity: SeverityLevel;
  summary: string;
  flaggedValues: { name: string; reason: string }[];
}

export interface GuideResult {
  steps: string[];
  questions: string[];
}

export type AgentStatus = "waiting" | "running" | "done";

export type AgentId = "scan" | "risk" | "explain" | "translate" | "guide";

export interface SessionPayload {
  base64: string;
  mimeType: string;
  language: string;
  fileName: string;
}
