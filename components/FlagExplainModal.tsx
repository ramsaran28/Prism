"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getValueLabel } from "@/lib/labValueNames";
import type { LabValue, ValueStatus } from "@/lib/types";

interface FlagExplainModalProps {
  open: boolean;
  onClose: () => void;
  value: LabValue | null;
  relatedFlagged: LabValue[];
}

function badgeForStatus(status: ValueStatus): {
  label: string;
  className: string;
} {
  if (status === "high") return { label: "High", className: "badge-critical" };
  if (status === "low") return { label: "Low", className: "badge-warn" };
  return { label: "Critical", className: "badge-critical" };
}

async function streamExplainFlag(
  value: LabValue,
  relatedFlagged: LabValue[],
  onChunk: (text: string) => void
): Promise<string> {
  const res = await fetch("/api/agents/explain-flag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, relatedFlagged }),
  });
  if (!res.ok || !res.body) throw new Error("explain-flag failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    full += decoder.decode(chunk, { stream: true });
    onChunk(full);
  }
  return full;
}

export function FlagExplainModal({
  open,
  onClose,
  value,
  relatedFlagged,
}: FlagExplainModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return;
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 100);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !value) return;

    setText("");
    setLoading(true);
    setStreaming(true);

    void streamExplainFlag(value, relatedFlagged, setText)
      .catch(() =>
        setText(
          "We couldn't explain this value right now. Please try again in a moment."
        )
      )
      .finally(() => {
        setLoading(false);
        setStreaming(false);
      });
  }, [open, value, relatedFlagged]);

  useEffect(() => {
    if (!mounted || !visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mounted, visible, onClose]);

  if (!mounted || !value) return null;

  const badge = badgeForStatus(value.status);
  const title = getValueLabel(value);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.75)",
        opacity: visible ? 1 : 0,
        transition: "opacity 150ms ease",
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="relative w-[90%]"
        style={{
          maxWidth: 460,
          background: "#252830",
          border: "0.5px solid #32364A",
          borderRadius: 16,
          padding: "24px 28px",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className={badge.className}>{badge.label}</span>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0"
            style={{ color: "#8E92A8", cursor: "pointer" }}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
            fontSize: 18,
            fontWeight: 400,
            color: "#E8EAF2",
          }}
        >
          {title}
        </h2>

        {loading && !text ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-3 rounded bg-[#32364A]" />
            <div className="h-3 w-[92%] rounded bg-[#32364A]" />
            <div className="h-3 w-[85%] rounded bg-[#32364A]" />
            <div className="mt-4 h-3 rounded bg-[#32364A]" />
            <div className="h-3 w-[88%] rounded bg-[#32364A]" />
          </div>
        ) : (
          <div
            className="whitespace-pre-wrap"
            style={{
              fontSize: 16,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 400,
              color: "#8B8FA8",
              lineHeight: 1.8,
            }}
          >
            {text}
            {streaming && (
              <span className="cursor-blink ml-0.5 inline-block h-4 w-0.5 align-middle" />
            )}
          </div>
        )}

        {!streaming && text && (
          <>
            <div
              className="my-5"
              style={{ height: 0.5, background: "#32364A" }}
            />
            <p
              style={{
                fontSize: 12,
                fontFamily: "var(--font-inter), Inter, sans-serif",
                color: "#8E92A8",
                lineHeight: 1.6,
              }}
            >
              Explained by Gemini 2.5 Flash · Based on your specific report
              values
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full"
          style={{
            padding: 10,
            background: "#4ECBA8",
            color: "#0A0B0F",
            fontSize: 16,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
