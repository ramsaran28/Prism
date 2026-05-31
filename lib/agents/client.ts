import { valuesWithPlainNames } from "@/lib/labValueNames";
import type {
  GuideResult,
  LabValue,
  RiskResult,
  ScanResult,
  ScoreResult,
} from "@/lib/types";
import type { SessionPayload } from "@/lib/types";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function callScanAgent(
  session: Pick<SessionPayload, "base64" | "mimeType">
): Promise<ScanResult> {
  const res = await fetch("/api/agents/scan", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      base64: session.base64,
      mimeType: session.mimeType,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[callScanAgent] HTTP", res.status, data);
    throw new Error("SCAN failed");
  }
  if (data.error) throw new Error(data.error);
  return data as ScanResult;
}

export async function callRiskAgent(values: LabValue[]): Promise<RiskResult> {
  const payload = { values: valuesWithPlainNames(values) };
  const res = await fetch("/api/agents/risk", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[callRiskAgent] HTTP", res.status, data);
    throw new Error("RISK failed");
  }
  if (data.error) throw new Error(data.error);
  return data as RiskResult;
}

export async function callGuideAgent(risk: RiskResult): Promise<GuideResult> {
  const res = await fetch("/api/agents/guide", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      flaggedValues: risk.flaggedValues,
      severity: risk.severity,
      risk,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[callGuideAgent] HTTP", res.status, data);
    throw new Error("GUIDE failed");
  }
  if (data.error) throw new Error(data.error);
  return data as GuideResult;
}

export async function callTranslateAgent(
  summary: string,
  targetLanguage: string
): Promise<string> {
  const res = await fetch("/api/agents/translate", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ summary, targetLanguage }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[callTranslateAgent] HTTP", res.status, data);
    throw new Error("TRANSLATE failed");
  }
  if (data.error) throw new Error(data.error);
  const translation = data.translation as string;
  if (!translation?.trim()) {
    console.error("[callTranslateAgent] empty translation field", data);
    throw new Error("TRANSLATE returned empty");
  }
  return translation;
}

export async function streamExplainAgent(
  values: LabValue[],
  risk: RiskResult,
  onChunk: (text: string) => void
): Promise<string> {
  const payload = {
    values: valuesWithPlainNames(values),
    risk,
  };

  const res = await fetch("/api/agents/explain", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[streamExplainAgent] HTTP", res.status, errText);
    throw new Error("EXPLAIN failed");
  }

  const text = await res.text();
  if (!text.trim()) {
    console.error("[streamExplainAgent] empty response body");
    throw new Error("EXPLAIN returned empty");
  }

  onChunk(text);
  return text;
}

export async function callScoreAgent(
  values: LabValue[],
  riskData: RiskResult
): Promise<ScoreResult> {
  const res = await fetch("/api/agents/score", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      values: valuesWithPlainNames(values),
      riskData,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[callScoreAgent] HTTP", res.status, data);
    throw new Error("SCORE failed");
  }
  if (data.error) throw new Error(data.error);
  return data as ScoreResult;
}
