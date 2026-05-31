"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  Scan,
  AlertTriangle,
  MessageCircle,
  Languages,
  Compass,
  Activity,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { PrismIcon } from "./PrismIcon";
import type { AgentId, AgentStatus } from "@/lib/types";

const AGENTS: { id: AgentId; name: string; icon: typeof Scan }[] = [
  { id: "scan", name: "Scan", icon: Scan },
  { id: "risk", name: "Risk", icon: AlertTriangle },
  { id: "explain", name: "Explain", icon: MessageCircle },
  { id: "translate", name: "Translate", icon: Languages },
  { id: "guide", name: "Guide", icon: Compass },
  { id: "score", name: "Score", icon: Activity },
];

export type DashboardSectionRefs = Partial<
  Record<AgentId, RefObject<HTMLElement | null>>
>;

interface AgentStatusPanelProps {
  statuses: Record<AgentId, AgentStatus>;
  sectionRefs: DashboardSectionRefs;
  topRef?: RefObject<HTMLElement | null>;
}

function StatusDot({ status }: { status: AgentStatus }) {
  const prevStatus = useRef<AgentStatus>(status);
  const [justDone, setJustDone] = useState(false);

  useEffect(() => {
    if (prevStatus.current === "running" && status === "done") {
      setJustDone(true);
      const t = setTimeout(() => setJustDone(false), 200);
      prevStatus.current = status;
      return () => clearTimeout(t);
    }
    prevStatus.current = status;
  }, [status]);

  if (status === "waiting") {
    return (
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-status-waiting"
        aria-hidden
      />
    );
  }
  if (status === "running") {
    return (
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-warning animate-pulse-dot"
        aria-hidden
      />
    );
  }
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent ${justDone ? "status-dot-done" : ""}`}
      aria-hidden
    />
  );
}

function statusLabel(status: AgentStatus): string {
  if (status === "waiting") return "Waiting";
  if (status === "running") return "Running";
  return "Done";
}

function statusTextColor(status: AgentStatus): string {
  if (status === "waiting") return "#3E4260";
  if (status === "running") return "#D4956A";
  return "#4ECBA8";
}

function agentItemColors(status: AgentStatus, isActive: boolean) {
  if (isActive) {
    return {
      icon: status === "waiting" ? "#3E4260" : status === "running" ? "#D4956A" : "#4ECBA8",
      name: "#E8EAF2",
      bg: "#252830",
      border: "#4ECBA8",
    };
  }
  if (status === "waiting") {
    return { icon: "#3E4260", name: "#8E92A8", bg: "transparent", border: "transparent" };
  }
  if (status === "running") {
    return { icon: "#D4956A", name: "#E8EAF2", bg: "transparent", border: "transparent" };
  }
  return { icon: "#4ECBA8", name: "#E8EAF2", bg: "transparent", border: "transparent" };
}

export function AgentStatusPanel({
  statuses,
  sectionRefs,
  topRef,
}: AgentStatusPanelProps) {
  const [activeSection, setActiveSection] = useState<AgentId | null>("scan");
  const [hoveredId, setHoveredId] = useState<AgentId | null>(null);

  useEffect(() => {
    const elements: { id: AgentId; el: HTMLElement }[] = [];
    if (topRef?.current) elements.push({ id: "scan", el: topRef.current });
    for (const agent of AGENTS) {
      if (agent.id === "scan") continue;
      const el = sectionRefs[agent.id]?.current;
      if (el) elements.push({ id: agent.id, el });
    }
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-agent-section");
          if (id) setActiveSection(id as AgentId);
        }
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    elements.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionRefs, topRef]);

  const scrollToAgent = useCallback(
    (id: AgentId) => {
      if (id === "scan") {
        topRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      sectionRefs[id]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [sectionRefs, topRef]
  );

  return (
    <aside
      className="flex w-[220px] shrink-0 flex-col bg-sidebar"
      style={{ borderRight: "0.5px solid #32364A" }}
      aria-label="Analysis progress"
    >
      <div
        className="border-b border-border"
        style={{ padding: "20px 16px" }}
      >
        <div className="flex items-center gap-2">
          <PrismIcon size={22} />
          <span className="sidebar-logo-text">Prism</span>
        </div>
        <p className="sidebar-tagline mt-1">Medical Intelligence</p>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
        <p
          className="sidebar-agents-label"
          style={{ padding: "16px 16px 8px" }}
        >
          Agents
        </p>

        <ul className="flex flex-col gap-0.5">
          {AGENTS.map(({ id, name, icon: Icon }) => {
            const status = statuses[id];
            const isActive = activeSection === id;
            const isHovered = hoveredId === id;
            const colors = agentItemColors(status, isActive || isHovered);

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => scrollToAgent(id)}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="flex w-full items-center gap-2.5 text-left transition-all duration-[120ms] ease-in-out"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: isHovered || isActive ? "#252830" : colors.bg,
                    borderLeft: `2px solid ${isHovered || isActive ? "#4ECBA8" : colors.border}`,
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: isHovered ? "#4ECBA8" : colors.icon }}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span
                    className="sidebar-agent-name min-w-0 flex-1"
                    style={{
                      color: isHovered ? "#E8EAF2" : colors.name,
                    }}
                  >
                    {name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusDot status={status} />
                    <span
                      className="sidebar-agent-status"
                      style={{ color: statusTextColor(status) }}
                    >
                      {statusLabel(status)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          style={{
            height: 0.5,
            background: "#32364A",
            margin: "12px 8px",
          }}
        />

        <Link
          href="/about"
          className="flex items-center gap-2.5 transition-all duration-[120ms] ease-in-out"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            borderLeft: "2px solid transparent",
            color: "#8E92A8",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#252830";
            e.currentTarget.style.borderLeftColor = "#4ECBA8";
            e.currentTarget.style.color = "#E8EAF2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderLeftColor = "transparent";
            e.currentTarget.style.color = "#8E92A8";
          }}
        >
          <BookOpen className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="sidebar-about-link">About Prism</span>
        </Link>
      </div>

      <div className="p-2">
        <div
          style={{
            background: "#4ECBA808",
            border: "0.5px solid #4ECBA825",
            borderRadius: 8,
            padding: "10px 12px",
            margin: 8,
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-[14px] w-[14px] shrink-0"
              style={{ color: "#4ECBA8" }}
              strokeWidth={1.5}
            />
            <span className="sidebar-privacy-title">Zero data stored</span>
          </div>
          <p className="sidebar-privacy-note mt-1 pl-[22px]">
            Session only · Nothing saved
          </p>
        </div>
      </div>
    </aside>
  );
}
