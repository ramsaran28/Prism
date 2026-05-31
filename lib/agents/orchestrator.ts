import type {
  AgentId,
  AgentStatus,
  GuideResult,
  RiskResult,
  ScanResult,
  ScoreResult,
  SessionPayload,
} from "@/lib/types";
import {
  callGuideAgent,
  callRiskAgent,
  callScanAgent,
  callScoreAgent,
  callTranslateAgent,
  streamExplainAgent,
} from "./client";
import { AGENT_MIN_MS, delay, withMinimumDelay } from "./delays";
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
  onScoreResult: (score: ScoreResult) => void;
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
 * Dependency graph:
 *   SCAN
 *     ├─ RISK ──┬─ GUIDE
 *     │         └─ SCORE
 *     └─ EXPLAIN ── TRANSLATE
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
      const scan = await withMinimumDelay(AGENT_MIN_MS.scan, () =>
        callScanAgent(session)
      );
      callbacks.onScanResult(scan);
      onStatus("scan", "done");
      scanGate.resolve(scan);
      return scan;
    } catch {
      await delay(AGENT_MIN_MS.scan);
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
      const risk = await withMinimumDelay(AGENT_MIN_MS.risk, () =>
        callRiskAgent(scan.values)
      );
      callbacks.onRiskResult(risk);
      onStatus("risk", "done");
      riskGate.resolve(risk);
      return risk;
    } catch {
      await delay(AGENT_MIN_MS.risk);
      onStatus("risk", "done");
      riskGate.resolve(EMPTY_RISK);
      return EMPTY_RISK;
    }
  })();

  const explainTask = (async () => {
    onStatus("explain", "waiting");
    const scan = await scanGate.promise;
    onStatus("explain", "running");
    callbacks.onExplainStart();
    const started = Date.now();
    try {
      const summary = await streamExplainAgent(
        scan.values,
        EMPTY_RISK,
        callbacks.onExplainChunk
      );
      const remaining = AGENT_MIN_MS.explain - (Date.now() - started);
      if (remaining > 0) await delay(remaining);
      onStatus("explain", "done");
      callbacks.onExplainEnd();
      return summary;
    } catch {
      const remaining = AGENT_MIN_MS.explain - (Date.now() - started);
      if (remaining > 0) await delay(remaining);
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
      const guide = await withMinimumDelay(AGENT_MIN_MS.guide, () =>
        callGuideAgent(risk)
      );
      callbacks.onGuideResult(guide);
      onStatus("guide", "done");
    } catch {
      await delay(AGENT_MIN_MS.guide);
      onStatus("guide", "done");
    }
  })();

  const scoreTask = (async () => {
    onStatus("score", "waiting");
    const [scan, risk] = await Promise.all([
      scanGate.promise,
      riskGate.promise,
    ]);
    onStatus("score", "running");
    try {
      const score = await withMinimumDelay(AGENT_MIN_MS.score, () =>
        callScoreAgent(scan.values, risk)
      );
      callbacks.onScoreResult(score);
      onStatus("score", "done");
    } catch {
      await delay(AGENT_MIN_MS.score);
      onStatus("score", "done");
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
      const translation = await withMinimumDelay(AGENT_MIN_MS.translate, () =>
        callTranslateAgent(summary, session.language)
      );
      callbacks.onTranslation(translation, session.language);
      onStatus("translate", "done");
    } catch {
      await delay(AGENT_MIN_MS.translate);
      onStatus("translate", "done");
    }
  })();

  await Promise.all([
    scanTask,
    riskTask,
    explainTask,
    guideTask,
    scoreTask,
    translateTask,
  ]);
}
