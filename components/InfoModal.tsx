"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  disclaimer?: string;
}

export function InfoModal({
  open,
  onClose,
  title,
  children,
  disclaimer,
}: InfoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 100);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted || !visible) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    if (!panel) {
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = "";
      };
    }

    const focusables = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onTab);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onTab);
      document.body.style.overflow = "";
    };
  }, [mounted, visible, onClose]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.75)",
        opacity: visible ? 1 : 0,
        transition: visible ? "opacity 150ms ease" : "opacity 100ms ease",
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="relative w-[90%]"
        style={{
          maxWidth: 440,
          background: "#16181F",
          border: "0.5px solid #232536",
          borderRadius: 16,
          padding: 28,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.96)",
          transition: visible
            ? "opacity 150ms ease, transform 150ms ease"
            : "opacity 100ms ease, transform 100ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="info-modal-title"
            style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 16,
              fontWeight: 400,
              color: "#EEEEF0",
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 transition-colors duration-150"
            style={{ color: "#454760", cursor: "pointer" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#8B8FA8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#454760";
            }}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div
          style={{
            height: 0.5,
            background: "#232536",
            margin: "12px 0",
          }}
        />

        <div
          style={{
            fontSize: 14,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            color: "#8B8FA8",
            lineHeight: 1.75,
          }}
        >
          {children}
          {disclaimer && (
            <p
              className="mt-4"
              style={{
                fontSize: 11,
                color: "#454760",
                lineHeight: 1.75,
              }}
            >
              {disclaimer}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full"
          style={{
            marginTop: 20,
            padding: 10,
            background: "#00C896",
            color: "#0A0B0F",
            fontSize: 14,
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
