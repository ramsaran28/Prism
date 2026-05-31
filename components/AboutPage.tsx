import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  Globe,
  MessageCircle,
  Scan,
  AlertTriangle,
  Languages,
  Compass,
} from "lucide-react";
import { PrismIcon } from "./PrismIcon";

const FEATURE_CARDS = [
  {
    icon: FileSearch,
    title: "Reads your report",
    description:
      "Upload any lab report or doctor's note. Prism reads it the way a doctor would — instantly, with no setup.",
  },
  {
    icon: MessageCircle,
    title: "Explains it simply",
    description:
      "No jargon. No abbreviations. Just plain words that tell you what's going on in your body and what actually matters.",
  },
  {
    icon: Globe,
    title: "Speaks your language",
    description:
      "Get your results explained in 100+ languages with a voice readout — so anyone can understand, anywhere in the world.",
  },
] as const;

const TECH_AGENTS = [
  { icon: Scan, name: "Scan", desc: "reads every value from your report" },
  { icon: AlertTriangle, name: "Risk", desc: "identifies what needs attention" },
  { icon: MessageCircle, name: "Explain", desc: "writes your plain language summary" },
  { icon: Languages, name: "Translate", desc: "converts to your language" },
  { icon: Compass, name: "Guide", desc: "creates your personal action plan" },
] as const;

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background/80">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <PrismIcon size={20} />
            <span className="logo-text">Prism</span>
          </Link>
          <Link
            href="/analyze"
            className="text-sm text-text-secondary transition-colors hover:text-accent"
          >
            Back to app
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-[720px] px-6 py-12 md:py-[48px]">
        <section className="mb-16 text-center">
          <div className="mb-4 flex justify-center">
            <PrismIcon size={40} />
          </div>
          <h1 className="font-display text-[32px] font-normal tracking-display-tight text-text-primary">
            Prism
          </h1>
          <p className="type-landing-sub mt-3">
            Your health report, in words you actually understand.
          </p>
          <div className="mx-auto mt-8 h-px max-w-xs bg-border" />
        </section>

        <section className="mb-16">
          <h2 className="type-h2-italic mb-5">The problem we&apos;re solving</h2>
          <div className="type-body space-y-4 text-[16px] text-[#aaaaaa]">
            <p>
              Every year, millions of people receive lab reports they don&apos;t
              understand. The paper comes back full of abbreviations, reference
              ranges, and numbers — and most people either panic, ignore it, or
              call five different people trying to figure out what it means.
            </p>
            <p>
              The people most affected are the ones who need clarity most —
              elderly patients, people in rural areas, non-English speakers,
              and anyone seeing a doctor for the first time. Medical literacy
              shouldn&apos;t be a privilege.
            </p>
            <p>
              And yet, the system hasn&apos;t changed. Reports are still written
              for doctors, not patients.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="type-h2 mb-6">What Prism does</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURE_CARDS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card-surface px-5 py-5">
                <Icon
                  className="mb-3 h-6 w-6 text-accent"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mb-2 text-sm font-medium text-text-primary">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="type-h2-italic mb-5">Why this matters</h2>
          <div className="type-body space-y-4 text-[16px] text-[#aaaaaa]">
            <p>
              Health anxiety is real. When you don&apos;t understand your results,
              your mind fills in the worst possible explanation. Prism replaces
              that fear with clarity.
            </p>
            <p>
              We built Prism because everyone deserves a calm, knowledgeable
              friend who can sit with them when they get confusing news — not
              just people who can afford a second opinion.
            </p>
            <p>
              This isn&apos;t a replacement for your doctor. It&apos;s the
              conversation that helps you walk into that appointment feeling
              informed, not afraid.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="type-h2-italic mb-5">Your privacy, completely</h2>
          <div className="type-body mb-8 space-y-4 text-[16px] text-[#aaaaaa]">
            <p>
              Prism never stores your data. Not your report, not your results, not
              even your language preference. Every session is completely fresh.
              When you close the tab, everything is gone — permanently.
            </p>
            <p>
              We built it this way on purpose. Medical data is the most personal
              thing there is. It shouldn&apos;t live on a server somewhere.
            </p>
          </div>
          <p className="rounded-element border border-accent-border bg-accent-muted px-6 py-4 text-center text-sm font-medium text-accent">
            Zero storage · Zero tracking · Zero data retained
          </p>
        </section>

        <section className="mb-16">
          <h2 className="type-h2 mb-5">Built with Gemini</h2>
          <p className="type-body mb-8 text-[16px] text-[#aaaaaa]">
            Prism uses Google&apos;s Gemini AI — one of the most capable
            multimodal models available — to read and understand medical documents
            the way a trained physician would. Five specialized agents work in
            parallel to analyze, explain, translate, and guide — all in seconds.
          </p>
          <ul className="space-y-3">
            {TECH_AGENTS.map(({ icon: Icon, name, desc }) => (
              <li
                key={name}
                className="card-surface flex items-center gap-4 px-4 py-3"
              >
                <Icon
                  className="h-5 w-5 shrink-0 text-accent"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">{name}</span>
                  {" — "}
                  {desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-4 text-center">
          <Link href="/" className="btn-primary inline-flex">
            Analyze your report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </article>
    </div>
  );
}
