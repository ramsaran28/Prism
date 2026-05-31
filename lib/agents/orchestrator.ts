import type {
  AgentId,
  AgentStatus,
  GuideResult,
  RiskResult,
  ScanResult,
  SessionPayload,
} from "@/lib/types";
import {
  callGuideAgent,
  callRiskAgent,
  callScanAgent,
  callTranslateAgent,
  streamExplainAgent,
} from "./client";
import { createGate } from "./gate";

export type AgentStatusChange = (id: AgentId, status: AgentStatus) => void;

export interface AgentOrchestratorCallbacks {
  onStatus: AgentStatusChange;
  onScanResult: (scan: ScanResult) => void;
  onRiskResult: (risk: RiskResult) => void;
  onExplainChunk: (text: string) => void;
  onExplainStart: () => void;
  onExplainEnd: () => void;
  onGuideResult: (guide: GuideResult) => void;
  onTranslation: (text: string, language: string) => void;
  onError: (message: string) => void;
}

const EMPTY_SCAN: ScanResult = { values: [] };
const EMPTY_RISK: RiskResult = {
  severity: "normal",
  summary: "",
  flaggedValues: [],
};

/**
 * Registers all 5 agent tasks at once and awaits them with Promise.all.
 * Each task moves waiting → running only when its HTTP call starts, and
 * resolves independently so the UI can update per card.
 *
 * Dependency graph (max parallel where data allows):
 *   SCAN
 *     ├─ RISK ──┬─ GUIDE
 *     │         └─ (severity)
 *     └─ EXPLAIN (after SCAN + RISK) ── TRANSLATE
 *
 * After SCAN: RISK runs alone. After RISK: EXPLAIN + GUIDE run in parallel.
 */
export async function runAgentsInParallel(
  session: SessionPayload,
  callbacks: AgentOrchestratorCallbacks
): Promise<void> {
  const { onStatus } = callbacks;
  const scanGate = createGate<ScanResult>();
  const riskGate = createGate<RiskResult>();

  const scanTask = (async () => {
    onStatus("scan", "running");
    try {
      const scan = await callScanAgent(session);
      callbacks.onScanResult(scan);
      onStatus("scan", "done");
      scanGate.resolve(scan);
      return scan;
    } catch {
      onStatus("scan", "done");
      callbacks.onError(
        "We could not read your report. Please try uploading again."
      );
      scanGate.resolve(EMPTY_SCAN);
      return EMPTY_SCAN;
    }
  })();

  const riskTask = (async () => {
    onStatus("risk", "waiting");
    const scan = await scanGate.promise;
    onStatus("risk", "running");
    try {
      const risk = await callRiskAgent(scan.values);
      callbacks.onRiskResult(risk);
      onStatus("risk", "done");
      riskGate.resolve(risk);
      return risk;
    } catch {
      onStatus("risk", "done");
      riskGate.resolve(EMPTY_RISK);
      return EMPTY_RISK;
    }
  })();

  const explainTask = (async () => {
    onStatus("explain", "waiting");
    const [scan, risk] = await Promise.all([scanGate.promise, riskGate.promise]);
    onStatus("explain", "running");
    callbacks.onExplainStart();
    try {
      const summary = await streamExplainAgent(
        scan.values,
        risk,
        callbacks.onExplainChunk
      );
      onStatus("explain", "done");
      callbacks.onExplainEnd();
      return summary;
    } catch {
      onStatus("explain", "done");
      callbacks.onExplainEnd();
      return "";
    }
  })();

  const guideTask = (async () => {
    onStatus("guide", "waiting");
    const risk = await riskGate.promise;
    onStatus("guide", "running");
    try {
      const guide = await callGuideAgent(risk);
      callbacks.onGuideResult(guide);
      onStatus("guide", "done");
    } catch {
      onStatus("guide", "done");
    }
  })();

  const translateTask = (async () => {
    onStatus("translate", "waiting");
    const summary = await explainTask;
    if (!summary.trim()) {
      onStatus("translate", "done");
      return;
    }
    onStatus("translate", "running");
    try {
      const translation = await callTranslateAgent(
        summary,
        session.language
      );
      callbacks.onTranslation(translation, session.language);
      onStatus("translate", "done");
    } catch {
      onStatus("translate", "done");
    }
  })();

  await Promise.all([scanTask, riskTask, explainTask, guideTask, translateTask]);
}
