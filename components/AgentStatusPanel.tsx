"use client";

import Link from "next/link";
import {
  Scan,
  AlertTriangle,
  MessageCircle,
  Languages,
  Compass,
  Lock,
  Info,
} from "lucide-react";
import { PrismLogo } from "./PrismLogo";
import type { AgentId, AgentStatus } from "@/lib/types";

const AGENTS: { id: AgentId; name: string; icon: typeof Scan }[] = [
  { id: "scan", name: "Scan", icon: Scan },
  { id: "risk", name: "Risk", icon: AlertTriangle },
  { id: "explain", name: "Explain", icon: MessageCircle },
  { id: "translate", name: "Translate", icon: Languages },
  { id: "guide", name: "Guide", icon: Compass },
];

interface AgentStatusPanelProps {
  statuses: Record<AgentId, AgentStatus>;
}

function StatusDot({ status }: { status: AgentStatus }) {
  if (status === "running") {
    return (
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full bg-warning animate-pulse-dot"
        aria-hidden
      />
    );
  }
  if (status === "done") {
    return (
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full bg-accent"
        aria-hidden
      />
    );
  }
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full bg-status-waiting"
      aria-hidden
    />
  );
}

function statusLabel(status: AgentStatus): string {
  if (status === "waiting") return "Waiting";
  if (status === "running") return "Running";
  return "Done";
}

function statusColor(status: AgentStatus): string {
  if (status === "waiting") return "#4E4C5E";
  if (status === "running") return "#F5A623";
  return "#00D4AA";
}

export function AgentStatusPanel({ statuses }: AgentStatusPanelProps) {
  return (
    <aside
      className="flex w-[220px] shrink-0 flex-col border-r border-border bg-sidebar"
      aria-label="Analysis progress"
    >
      <div className="border-b border-border px-4 py-5">
        <PrismLogo />
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-2 py-3">
        {AGENTS.map(({ id, name, icon: Icon }) => {
          const status = statuses[id];
          return (
            <li
              key={id}
              className="sidebar-agent-item flex items-center gap-2.5 px-4 py-3"
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0 text-text-tertiary"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="sidebar-agent-name">{name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusDot status={status} />
                  <span
                    className="text-[11px] font-normal"
                    style={{ color: statusColor(status) }}
                  >
                    {statusLabel(status)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border px-2 py-2">
        <Link
          href="/about"
          className="sidebar-nav-link flex items-center gap-2.5 rounded-element border-l-2 border-transparent px-4 py-3 transition-all duration-150"
        >
          <Info
            className="h-[18px] w-[18px] shrink-0 text-text-tertiary"
            strokeWidth={1.5}
          />
          <span className="text-[13px] font-medium text-text-secondary">
            About Prism
          </span>
        </Link>
      </div>

      <div className="mt-auto flex items-start gap-2 p-4">
        <Lock
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="sidebar-footer-text">Nothing is saved. Ever.</p>
      </div>
    </aside>
  );
}
