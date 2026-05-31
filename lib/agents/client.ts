import { valuesWithPlainNames } from "@/lib/labValueNames";
import type { GuideResult, LabValue, RiskResult, ScanResult } from "@/lib/types";
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
  if (!res.ok) throw new Error("SCAN failed");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as ScanResult;
}

export async function callRiskAgent(values: LabValue[]): Promise<RiskResult> {
  const res = await fetch("/api/agents/risk", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ values: valuesWithPlainNames(values) }),
  });
  if (!res.ok) throw new Error("RISK failed");
  const data = await res.json();
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
  if (!res.ok) throw new Error("GUIDE failed");
  const data = await res.json();
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
  if (!res.ok) throw new Error("TRANSLATE failed");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.translation as string;
}

export async function streamExplainAgent(
  values: LabValue[],
  risk: RiskResult,
  onChunk: (text: string) => void
): Promise<string> {
  const res = await fetch("/api/agents/explain", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      values: valuesWithPlainNames(values),
      risk,
    }),
  });
  if (!res.ok || !res.body) throw new Error("EXPLAIN failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onChunk(full);
  }

  return full;
}
