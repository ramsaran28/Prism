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
import { PrivacyFooter } from "./PrivacyFooter";
import { runAgentsInParallel } from "@/lib/agents/orchestrator";
import { normalizeLabValues } from "@/lib/labValueNames";
import { callTranslateAgent } from "@/lib/agents/client";
import { loadSession, clearSession } from "@/lib/session";
import type {
  AgentId,
  AgentStatus,
  GuideResult,
  LabValue,
  RiskResult,
  SeverityLevel,
} from "@/lib/types";

const initialStatuses: Record<AgentId, AgentStatus> = {
  scan: "waiting",
  risk: "waiting",
  explain: "waiting",
  translate: "waiting",
  guide: "waiting",
};

export function AnalyzeDashboard() {
  const router = useRouter();
  const started = useRef(false);
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
  const [error, setError] = useState<string | null>(null);

  const setAgent = useCallback((id: AgentId, status: AgentStatus) => {
    setStatuses((s) => ({ ...s, [id]: status }));
  }, []);

  const runAnalysis = useCallback(async () => {
    const session = loadSession();
    if (!session) {
      router.replace("/");
      return;
    }

    setActiveLang(session.language);
    setStatuses(initialStatuses);
    setValues([]);
    setSeverity(null);
    setRisk(null);
    setSummary("");
    setTranslation(null);
    setGuide(null);
    setError(null);

    await runAgentsInParallel(session, {
      onStatus: setAgent,
      onScanResult: (scan) =>
        setValues(normalizeLabValues(scan.values ?? [])),
      onRiskResult: (riskResult) => {
        setRisk(riskResult);
        setSeverity(riskResult.severity);
      },
      onExplainStart: () => setSummaryStreaming(true),
      onExplainChunk: setSummary,
      onExplainEnd: () => setSummaryStreaming(false),
      onGuideResult: setGuide,
      onTranslation: (text, lang) => {
        setTranslation(text);
        setActiveLang(lang);
      },
      onError: setError,
    });
  }, [router, setAgent]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void runAnalysis();
  }, [runAnalysis]);

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
      const text = await callTranslateAgent(summary, lang);
      setTranslation(text);
      setActiveLang(lang);
    } finally {
      setAgent("translate", "done");
      setTranslateLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AgentStatusPanel statuses={statuses} />

      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <AnalyzeTopBar />

          {error && (
            <p className="rounded-element border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <SeverityBanner severity={severity} />

          {values.length > 0 && (
            <ValueAnalysisSection
              values={values}
              flaggedValues={risk?.flaggedValues ?? []}
            />
          )}

          {values.length > 0 && <BodySystemsMap values={values} risk={risk} />}

          <SummaryCard text={summary} streaming={summaryStreaming} />

          <ActionPlanCard guide={guide} />

          <FamilyExplain
            summary={summary}
            disabled={summaryStreaming || !summary}
          />

          <LanguageSection
            translation={translation}
            activeLanguage={activeLang}
            onSwitch={handleLanguageSwitch}
            loading={translateLoading}
          />

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleStartOver}
              className="btn-start-over"
            >
              Start over
            </button>
          </div>

          <PrivacyFooter />
        </div>
      </main>
    </div>
  );
}
