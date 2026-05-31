"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentStatusPanel } from "./AgentStatusPanel";
import { AnalyzeTopBar } from "./AnalyzeTopBar";
import { SeverityBanner } from "./SeverityBanner";
import { ValueAnalysisSection } from "./ValueAnalysisSection";
import { BodySystemsMap } from "./BodySystemsMap";
import { SummaryCard } from "./SummaryCard";
import { ActionPlanCard } from "./ActionPlanCard";
import { FamilyExplain } from "./FamilyExplain";
import { LanguageSection } from "./LanguageSection";
import { HealthScoreCard } from "./HealthScoreCard";
import { InfoModalProvider } from "./InfoModalContext";
import { PrivacyFooter } from "./PrivacyFooter";
import { DownloadSummaryButton } from "./DownloadSummaryButton";
import { runAgentsInParallel } from "@/lib/agents/orchestrator";
import { normalizeLabValues } from "@/lib/labValueNames";
import { callTranslateAgent } from "@/lib/agents/client";
import { prefetchTts } from "@/lib/ttsClient";
import { loadSession, clearSession } from "@/lib/session";
import type {
  AgentId,
  AgentStatus,
  GuideResult,
  LabValue,
  RiskResult,
  ScoreResult,
  SeverityLevel,
} from "@/lib/types";

const initialStatuses: Record<AgentId, AgentStatus> = {
  scan: "waiting",
  risk: "waiting",
  explain: "waiting",
  translate: "waiting",
  guide: "waiting",
  score: "waiting",
};

export function AnalyzeDashboard() {
  const router = useRouter();
  const runIdRef = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const explainRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);

  const sectionRefs = {
    risk: riskRef,
    score: scoreRef,
    explain: explainRef,
    guide: guideRef,
    translate: translateRef,
  };

  const [statuses, setStatuses] = useState(initialStatuses);
  const [values, setValues] = useState<LabValue[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [summary, setSummary] = useState("");
  const [summaryStreaming, setSummaryStreaming] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState("English (US)");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [guide, setGuide] = useState<GuideResult | null>(null);
  const [healthScore, setHealthScore] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAgent = useCallback((id: AgentId, status: AgentStatus) => {
    setStatuses((s) => ({ ...s, [id]: status }));
  }, []);

  useEffect(() => {
    let active = true;
    const runId = ++runIdRef.current;
    const isCurrent = () => active && runId === runIdRef.current;

    async function runAnalysis() {
      const session = loadSession();
      if (!session) {
        router.replace("/");
        return;
      }

      console.log("[AnalyzeDashboard] starting run", runId, {
        language: session.language,
        mimeType: session.mimeType,
      });

      setActiveLang(session.language);
      setStatuses({ ...initialStatuses });
      setValues([]);
      setSeverity(null);
      setRisk(null);
      setSummary("");
      setTranslation(null);
      setGuide(null);
      setHealthScore(null);
      setError(null);

      await runAgentsInParallel(session, {
        onStatus: (id, status) => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] status", id, status);
          setAgent(id, status);
        },
        onScanResult: (scan) => {
          if (!isCurrent()) return;
          const normalized = normalizeLabValues(scan.values ?? []);
          console.log("[AnalyzeDashboard] SCAN → state", normalized.length, "values");
          setValues(normalized);
        },
        onRiskResult: (riskResult) => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] RISK → state", riskResult);
          setRisk(riskResult);
          setSeverity(riskResult.severity);
        },
        onExplainStart: () => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] EXPLAIN start");
          setSummaryStreaming(true);
        },
        onExplainChunk: (text) => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] EXPLAIN chunk length", text.length);
          setSummary(text);
        },
        onExplainEnd: () => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] EXPLAIN end");
          setSummaryStreaming(false);
        },
        onGuideResult: (guideResult) => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] GUIDE → state", guideResult);
          setGuide(guideResult);
        },
        onScoreResult: (score) => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] SCORE → state", score);
          setHealthScore(score);
        },
        onTranslation: (text, lang) => {
          if (!isCurrent()) return;
          console.log("[AnalyzeDashboard] TRANSLATE → state", text.length, lang);
          setTranslation(text);
          setActiveLang(lang);
          void prefetchTts(text, lang);
        },
        onError: (message) => {
          if (!isCurrent()) return;
          console.error("[AnalyzeDashboard] error", message);
          setError(message);
        },
      });

      console.log("[AnalyzeDashboard] run complete", runId);
    }

    void runAnalysis();

    return () => {
      active = false;
    };
  }, [router, setAgent]);

  function handleStartOver() {
    clearSession();
    router.push("/");
  }

  async function handleLanguageSwitch(lang: string) {
    if (!summary) return;
    setTranslateLoading(true);
    setTranslation(null);
    setAgent("translate", "running");
    try {
      console.log("[AnalyzeDashboard] manual translate", lang);
      const text = await callTranslateAgent(summary, lang);
      console.log("[AnalyzeDashboard] manual translate result length", text.length);
      setTranslation(text);
      setActiveLang(lang);
      void prefetchTts(text, lang);
    } catch (err) {
      console.error("[AnalyzeDashboard] manual translate failed", err);
      setError("Translation could not be loaded. Please try again.");
    } finally {
      setAgent("translate", "done");
      setTranslateLoading(false);
    }
  }

  return (
    <InfoModalProvider>
      <div className="flex min-h-screen bg-background">
        <AgentStatusPanel
          statuses={statuses}
          sectionRefs={sectionRefs}
          topRef={topRef}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AnalyzeTopBar />

          <main className="flex-1 px-7 py-5">
            <div className="mx-auto max-w-5xl">
              <div ref={topRef} data-agent-section="scan" className="scroll-mt-20" />

              {error && (
                <p className="mb-5 rounded-xl border border-danger/30 bg-danger-muted px-4 py-3 text-[14px] text-danger">
                  {error}
                </p>
              )}

              <div ref={riskRef} data-agent-section="risk" className="scroll-mt-20">
                <SeverityBanner severity={severity} />
              </div>

              <div ref={scoreRef} data-agent-section="score" className="scroll-mt-20">
                <HealthScoreCard score={healthScore} />
              </div>

              {values.length > 0 && (
                <ValueAnalysisSection
                  values={values}
                  flaggedValues={risk?.flaggedValues ?? []}
                />
              )}

              {values.length > 0 && (
                <BodySystemsMap values={values} risk={risk} />
              )}

              <div ref={explainRef} data-agent-section="explain" className="scroll-mt-20">
                <SummaryCard text={summary} streaming={summaryStreaming} />
              </div>

              <div ref={guideRef} data-agent-section="guide" className="scroll-mt-20">
                <ActionPlanCard guide={guide} />
              </div>

              <FamilyExplain
                summary={summary}
                disabled={summaryStreaming || !summary}
              />

              <div ref={translateRef} data-agent-section="translate" className="scroll-mt-20">
                <LanguageSection
                  translation={translation}
                  activeLanguage={activeLang}
                  onSwitch={handleLanguageSwitch}
                  loading={translateLoading}
                />
              </div>

              <div
                className="flex flex-col items-center gap-3"
                style={{ marginTop: 48, marginBottom: 48 }}
              >
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <DownloadSummaryButton
                    healthScore={healthScore}
                    summary={summary}
                    guide={guide}
                    severity={severity}
                    agentsReady={
                      statuses.explain === "done" &&
                      statuses.guide === "done" &&
                      statuses.score === "done" &&
                      statuses.risk === "done"
                    }
                    disabled={summaryStreaming}
                  />
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="btn-start-over"
                  >
                    Start over
                  </button>
                </div>
                <p className="text-center text-[12px] text-text-tertiary">
                  Downloaded PDFs are not stored by Prism
                </p>
              </div>

              <PrivacyFooter />
            </div>
          </main>
        </div>
      </div>
    </InfoModalProvider>
  );
}
