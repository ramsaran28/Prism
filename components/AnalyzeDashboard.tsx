"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentStatusPanel } from "./AgentStatusPanel";
import { AnalyzeTopBar } from "./AnalyzeTopBar";
import { SeverityBanner } from "./SeverityBanner";
import { ValueAnalysisSection } from "./ValueAnalysisSection";
import { SummaryCard } from "./SummaryCard";
import { ActionPlanCard } from "./ActionPlanCard";
import { FamilyExplain } from "./FamilyExplain";
import { LanguageSection } from "./LanguageSection";
import { PrivacyFooter } from "./PrivacyFooter";
import { runAgentsInParallel } from "@/lib/agents/orchestrator";
import { callTranslateAgent } from "@/lib/agents/client";
import { loadSession, clearSession } from "@/lib/session";
import type {
  AgentId,
  AgentStatus,
  GuideResult,
  LabValue,
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
  const [language, setLanguage] = useState("English");
  const [statuses, setStatuses] = useState(initialStatuses);
  const [values, setValues] = useState<LabValue[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel | null>(null);
  const [summary, setSummary] = useState("");
  const [summaryStreaming, setSummaryStreaming] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState("English");
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

    setLanguage(session.language);
    setActiveLang(session.language);
    setStatuses(initialStatuses);
    setValues([]);
    setSeverity(null);
    setSummary("");
    setTranslation(null);
    setGuide(null);
    setError(null);

    await runAgentsInParallel(session, {
      onStatus: setAgent,
      onScanResult: (scan) => setValues(scan.values ?? []),
      onRiskResult: (risk) => setSeverity(risk.severity),
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
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <AnalyzeTopBar language={language} />

        <p className="text-center text-xs text-text-secondary">
          This is not medical advice. Please consult a qualified doctor.
        </p>

        {error && (
          <p className="rounded-card border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <AgentStatusPanel statuses={statuses} />

        <SeverityBanner severity={severity} />

        {values.length > 0 && <ValueAnalysisSection values={values} />}

        <SummaryCard text={summary} streaming={summaryStreaming} />

        <ActionPlanCard guide={guide} />

        <FamilyExplain summary={summary} disabled={summaryStreaming || !summary} />

        <LanguageSection
          translation={translation}
          activeLanguage={activeLang}
          selectedLanguage={language}
          onSwitch={handleLanguageSwitch}
          loading={translateLoading}
        />

        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleStartOver}
            className="rounded-element border border-border px-6 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-text-primary"
          >
            Start over
          </button>
        </div>

        <PrivacyFooter />
      </div>
    </main>
  );
}
