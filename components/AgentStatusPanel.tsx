"use client";

import {
  Scan,
  AlertTriangle,
  MessageCircle,
  Languages,
  Compass,
} from "lucide-react";
import type { AgentId, AgentStatus } from "@/lib/types";

const AGENTS: { id: AgentId; name: string; icon: typeof Scan }[] = [
  { id: "scan", name: "SCAN", icon: Scan },
  { id: "risk", name: "RISK", icon: AlertTriangle },
  { id: "explain", name: "EXPLAIN", icon: MessageCircle },
  { id: "translate", name: "TRANSLATE", icon: Languages },
  { id: "guide", name: "GUIDE", icon: Compass },
];

interface AgentStatusPanelProps {
  statuses: Record<AgentId, AgentStatus>;
}

function StatusDot({ status }: { status: AgentStatus }) {
  if (status === "running") {
    return (
      <span
        className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse-dot"
        aria-hidden
      />
    );
  }
  if (status === "done") {
    return (
      <span
        className="inline-block h-2 w-2 rounded-full bg-accent"
        aria-hidden
      />
    );
  }
  return (
    <span
      className="inline-block h-2 w-2 rounded-full bg-text-secondary/50"
      aria-hidden
    />
  );
}

export function AgentStatusPanel({ statuses }: AgentStatusPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {AGENTS.map(({ id, name, icon: Icon }) => {
        const status = statuses[id];
        const label =
          status === "waiting"
            ? "Waiting"
            : status === "running"
              ? "Running"
              : "Done";
        return (
          <div
            key={id}
            className="flex flex-col items-center gap-2 rounded-card border border-border bg-card p-4"
          >
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <span className="text-xs font-medium tracking-wide text-text-primary">
              {name}
            </span>
            <div className="flex items-center gap-2">
              <StatusDot status={status} />
              <span className="text-xs text-text-secondary">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
