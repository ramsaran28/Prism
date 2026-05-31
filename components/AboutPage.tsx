"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  FileX,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { PrismIcon } from "./PrismIcon";
import { PrismLogo } from "./PrismLogo";
import { ThemeToggle } from "./ThemeToggle";

const PROBLEM_CARDS = [
  {
    icon: FileX,
    title: "1 in 3 patients leave confused",
    text: "Most people receive lab results with zero explanation. The report goes in a drawer, the worry stays in their head.",
  },
  {
    icon: Globe2,
    title: "1.5 billion people don't speak medical English",
    text: "Even fluent English speakers struggle with medical jargon. For the rest of the world, it's completely inaccessible.",
  },
  {
    icon: Clock,
    title: "Doctor appointments are 12 minutes long",
    text: "There's no time to explain every value. Patients leave with more questions than answers and nowhere to go.",
  },
] as const;

const AGENT_CARDS = [
  {
    number: "01",
    name: "SCAN",
    badgeColor: "#4ECBA8",
    description:
      "Reads every value, unit, and reference range from your report using Gemini's vision — PDFs, images, even handwritten notes.",
  },
  {
    number: "02",
    name: "RISK",
    badgeColor: "#4ECBA8",
    description:
      "Identifies which values are outside normal range, scores severity, and calculates a confidence level for each finding.",
  },
  {
    number: "03",
    name: "EXPLAIN",
    badgeColor: "#4ECBA8",
    description:
      "Writes a plain language summary — warm, honest, jargon-free. Starts with what's good. Always.",
  },
  {
    number: "04",
    name: "TRANSLATE",
    badgeColor: "#4ECBA8",
    description:
      "Converts your summary into any of 100+ languages while keeping the same caring tone throughout.",
  },
  {
    number: "05",
    name: "GUIDE",
    badgeColor: "#4ECBA8",
    description:
      "Creates a personal action plan and generates questions to bring to your next doctor's appointment.",
  },
  {
    number: "06",
    name: "SCORE",
    badgeColor: "#D4956A",
    description:
      "Calculates an overall health score out of 100 based on correlated markers — giving you one simple number to track over time.",
  },
] as const;

const TECH_PILLS = [
  "Gemini 2.5 Flash",
  "ElevenLabs Multilingual v2",
  "Next.js 14",
  "TypeScript",
  "Tailwind CSS",
  "Recharts",
  "Vercel",
  "100+ Languages",
  "Zero Database",
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="mb-2 uppercase tracking-[1px]"
      style={{
        fontSize: 12,
        fontFamily: "var(--font-inter), Inter, sans-serif",
        color: "#4ECBA8",
        marginBottom: 8,
      }}
    >
      {children}
    </p>
  );
}

function AgentCard({
  number,
  name,
  badgeColor,
  description,
}: (typeof AGENT_CARDS)[number]) {
  return (
    <div
      className="flex gap-4"
      style={{
        background: "#252830",
        border: "0.5px solid #32364A",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 10,
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: `${badgeColor}18`,
          color: badgeColor,
          fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {number}
      </div>
      <div>
        <p
          className="mb-1"
          style={{
            fontSize: 13,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 600,
            color: "#E8EAF2",
            letterSpacing: "0.5px",
          }}
        >
          {name}
        </p>
        <p
          style={{
            fontSize: 14,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            color: "#8B8FA8",
            lineHeight: 1.75,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function AboutPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true));
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      cancelAnimationFrame(timer);
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div
      className="min-h-screen transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <header className="border-b border-border" style={{ padding: "16px 40px" }}>
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <PrismLogo />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-[14px] text-text-tertiary transition-colors duration-150 hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back to app
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        className="mx-auto"
        style={{ maxWidth: 680, padding: "60px 24px" }}
      >
        {/* Section 1 — Hero */}
        <section className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4">
            <PrismIcon size={36} />
          </div>
          <h1
            className="mb-6 whitespace-pre-line italic"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 36,
              fontWeight: 300,
              fontStyle: "italic",
              color: "#E8EAF2",
              lineHeight: 1.25,
            }}
          >
            Built for the person who just got{"\n"}a report they don&apos;t
            understand.
          </h1>
          <p
            className="mx-auto max-w-[520px]"
            style={{
              fontSize: 16,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 300,
              color: "#8B8FA8",
              lineHeight: 1.8,
            }}
          >
            That moment of confusion — staring at numbers and abbreviations,
            not knowing if you should panic or ignore it — is what Prism was
            built to fix.
          </p>
        </section>

        {/* Section 2 — The Problem */}
        <section className="mb-16">
          <SectionLabel>THE PROBLEM</SectionLabel>
          <h2
            className="mb-6 italic"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 26,
              fontWeight: 400,
              fontStyle: "italic",
              color: "#E8EAF2",
              lineHeight: 1.35,
            }}
          >
            Medical reports are written for doctors.{"\n"}Not for you.
          </h2>
          <div>
            {PROBLEM_CARDS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                style={{
                  borderLeft: "2px solid #C4617A20",
                  background: "#252830",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 12,
                }}
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <Icon
                    className="h-5 w-5 shrink-0"
                    style={{ color: "#C4617A" }}
                    strokeWidth={1.5}
                  />
                  <h3
                    style={{
                      fontSize: 15,
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontWeight: 500,
                      color: "#E8EAF2",
                    }}
                  >
                    {title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    color: "#8B8FA8",
                    lineHeight: 1.75,
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — The Solution */}
        <section className="mb-16">
          <SectionLabel>WHAT PRISM DOES</SectionLabel>
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 26,
              fontWeight: 400,
              color: "#E8EAF2",
              lineHeight: 1.35,
            }}
          >
            Five intelligent agents. One clear answer.
          </h2>
          <p
            className="mb-6"
            style={{
              fontSize: 15,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              color: "#8B8FA8",
              lineHeight: 1.8,
            }}
          >
            Prism uses five specialized Gemini AI agents running in a directed
            pipeline — each with one job, done well.
          </p>
          {AGENT_CARDS.map((agent) => (
            <AgentCard key={agent.name} {...agent} />
          ))}
        </section>

        {/* Section 4 — Why It Matters */}
        <section className="mb-16">
          <SectionLabel>WHY IT MATTERS</SectionLabel>
          <h2
            className="mb-6 italic"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 26,
              fontWeight: 400,
              fontStyle: "italic",
              color: "#E8EAF2",
              lineHeight: 1.35,
            }}
          >
            Clarity isn&apos;t a luxury.{"\n"}It&apos;s a right.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              style={{
                borderLeft: "2px solid #4ECBA820",
                background: "#252830",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <span
                className="mb-2 block leading-none"
                style={{
                  fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
                  fontSize: 40,
                  color: "#4ECBA820",
                }}
                aria-hidden
              >
                &ldquo;
              </span>
              <p
                className="mb-4 italic"
                style={{
                  fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
                  fontSize: 16,
                  fontStyle: "italic",
                  color: "#E8EAF2",
                  lineHeight: 1.6,
                }}
              >
                My grandmother cried when she got her report. Not because
                something was wrong — but because she had no idea what any of it
                meant.
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  color: "#8E92A8",
                }}
              >
                — The reason Prism exists
              </p>
            </div>
            <div
              style={{
                borderLeft: "2px solid #4ECBA820",
                background: "#252830",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <span
                className="mb-2 block leading-none"
                style={{
                  fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
                  fontSize: 40,
                  color: "#4ECBA820",
                }}
                aria-hidden
              >
                &ldquo;
              </span>
              <p
                className="mb-4 italic"
                style={{
                  fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
                  fontSize: 16,
                  fontStyle: "italic",
                  color: "#E8EAF2",
                  lineHeight: 1.6,
                }}
              >
                Understanding your own health shouldn&apos;t require a medical
                degree or a second opinion you can&apos;t afford.
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  color: "#8E92A8",
                }}
              >
                — Our design principle
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 — Privacy */}
        <section className="mb-16">
          <SectionLabel>YOUR PRIVACY</SectionLabel>
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 26,
              fontWeight: 400,
              color: "#E8EAF2",
              lineHeight: 1.35,
            }}
          >
            We built zero storage{"\n"}into the foundation.
          </h2>
          <div
            className="mb-8 space-y-4"
            style={{
              fontSize: 15,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              color: "#8B8FA8",
              lineHeight: 1.8,
            }}
          >
            <p>
              Most health apps store your data. Prism was designed from day one
              to store nothing.
            </p>
            <p>
              Your report is read in your browser session, sent to Gemini for
              analysis, and the response comes back to you. Nothing is logged.
              Nothing is retained. When you close the tab, it&apos;s as if you
              were never here.
            </p>
            <p>
              Medical data is the most personal thing there is. It deserves to
              be treated that way.
            </p>
          </div>
          <div className="flex justify-center">
            <div
              className="inline-flex flex-col items-center text-center"
              style={{
                background: "#4ECBA80F",
                border: "0.5px solid #4ECBA830",
                borderRadius: 12,
                padding: "20px 32px",
              }}
            >
              <ShieldCheck
                className="mb-2 h-5 w-5"
                style={{ color: "#4ECBA8" }}
                strokeWidth={1.5}
              />
              <p
                className="mb-1"
                style={{
                  fontSize: 14,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 500,
                  color: "#4ECBA8",
                }}
              >
                Zero storage · Zero tracking · Zero data retained
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  color: "#8E92A8",
                }}
              >
                Your report disappears when you close this tab.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6 — Tech Stack */}
        <section className="mb-16">
          <SectionLabel>BUILT WITH</SectionLabel>
          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 24,
              fontWeight: 400,
              color: "#E8EAF2",
            }}
          >
            The technology behind Prism
          </h2>
          <div className="flex flex-wrap gap-2">
            {TECH_PILLS.map((pill) => (
              <span
                key={pill}
                style={{
                  background: "#252830",
                  border: "0.5px solid #32364A",
                  borderRadius: 99,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: 500,
                  color: "#8B8FA8",
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </section>

        {/* Section 7 — CTA */}
        <section
          className="flex flex-col items-center text-center"
          style={{ paddingTop: 40, paddingBottom: 60 }}
        >
          <h2
            className="mb-6 italic"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
              fontSize: 24,
              fontWeight: 300,
              fontStyle: "italic",
              color: "#E8EAF2",
            }}
          >
            Ready to understand your report?
          </h2>
          <Link
            href="/"
            className="btn-primary inline-flex justify-center"
            style={{ width: 240 }}
          >
            Upload your report
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p
            className="mt-2.5"
            style={{
              fontSize: 12,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              color: "#8E92A8",
            }}
          >
            Free · No account · Nothing saved
          </p>
        </section>
      </main>
    </div>
  );
}
