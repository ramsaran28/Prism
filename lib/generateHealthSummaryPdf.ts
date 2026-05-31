import jsPDF from "jspdf";
import { stripPrismOpener } from "@/lib/formatText";
import { severityToBanner } from "@/lib/severity";
import type {
  CategoryStatus,
  GuideResult,
  ScoreResult,
  SeverityLevel,
} from "@/lib/types";

const PAGE_W = 210;
const PAGE_H = 297;
const X_LEFT = 20;
const X_RIGHT = 190;
const CENTER_X = PAGE_W / 2;
const BAR_W = X_RIGHT - X_LEFT;
const FOOTER_Y = PAGE_H - 20;

const GAP_SECTION = 10;
const GAP_HEADER_TO_SCORE = 12;
const GAP_SCORE_TO_SUMMARY = 12;
const GAP_CATEGORY_ROW = 12;

export interface HealthSummaryPdfInput {
  healthScore: ScoreResult;
  summary: string;
  guide: GuideResult | null;
  severity: SeverityLevel | null;
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function setHexColor(doc: jsPDF, hex: string) {
  const [r, g, b] = hexRgb(hex);
  doc.setTextColor(r, g, b);
}

function stripPdfQuotes(text: string): string {
  return text.replace(/'([^']+)'/g, "$1");
}

function displayScore(raw: number): number {
  return Math.max(12, Math.round(raw));
}

function getScoreColor(total: number): string {
  if (total >= 80) return "#00A878";
  if (total >= 60) return "#C97D00";
  if (total >= 40) return "#C43050";
  return "#A84455";
}

function getScoreLabel(total: number): string {
  if (total >= 80) return "YOUR HEALTH LOOKS STRONG";
  if (total >= 60) return "A FEW THINGS TO WORK ON";
  if (total >= 40) return "NEEDS SOME ATTENTION";
  return "IMPORTANT TO SEE A DOCTOR";
}

function getCategoryColor(status: CategoryStatus): string {
  if (status === "good") return "#00A878";
  if (status === "fair") return "#C97D00";
  return "#C43050";
}

function categoryPercent(score: number, maxScore: number): number {
  return Math.round((score / maxScore) * 100);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function filenameDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function drawPageHeader(doc: jsPDF, generatedLabel: string): number {
  const top = X_LEFT;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setHexColor(doc, "#1a1a1a");
  doc.text("PRISM", X_LEFT, top + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setHexColor(doc, "#888888");
  doc.text("Medical Intelligence", X_LEFT, top + 11);

  doc.setFontSize(9);
  setHexColor(doc, "#aaaaaa");
  doc.text(generatedLabel, X_RIGHT, top + 4, { align: "right" });
  doc.text("Not medical advice", X_RIGHT, top + 9, { align: "right" });

  const headerBottom = top + 12;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(X_LEFT, headerBottom + 4, X_RIGHT, headerBottom + 4);

  return headerBottom + 4;
}

function ensureSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  generatedLabel: string
): number {
  if (y + needed > FOOTER_Y - 14) {
    doc.addPage();
    return drawPageHeader(doc, generatedLabel) + GAP_SECTION;
  }
  return y;
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawCenteredWrappedText(
  doc: jsPDF,
  text: string,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    doc.text(line, CENTER_X, y, { align: "center" });
    y += lineHeight;
  }
  return y;
}

function drawSectionLabel(doc: jsPDF, y: number, label: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setHexColor(doc, "#888888");
  doc.text(label, X_LEFT, y);
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(X_LEFT, y, X_RIGHT, y);
  return y + 4;
}

function drawBulletItem(
  doc: jsPDF,
  y: number,
  text: string,
  generatedLabel: string
): number {
  const clean = stripPdfQuotes(text);
  y = ensureSpace(doc, y, 14, generatedLabel);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setHexColor(doc, "#333333");

  const lines = doc.splitTextToSize(clean, 164);
  const lineHeight = 4.5;

  doc.text("•", X_LEFT, y);
  doc.text(lines[0], 26, y);
  for (let i = 1; i < lines.length; i++) {
    y += lineHeight;
    doc.text(lines[i], 26, y);
  }

  return y + lineHeight + 3;
}

function drawQuestionItem(
  doc: jsPDF,
  y: number,
  text: string,
  generatedLabel: string
): number {
  const clean = stripPdfQuotes(text);
  y = ensureSpace(doc, y, 14, generatedLabel);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  setHexColor(doc, "#444444");

  const lines = doc.splitTextToSize(clean, 163);
  const lineHeight = 4.5;

  doc.text("Q:", X_LEFT, y);
  doc.text(lines[0], 27, y);
  for (let i = 1; i < lines.length; i++) {
    y += lineHeight;
    doc.text(lines[i], 27, y);
  }

  return y + lineHeight + 3;
}

/** Renders PDF from a state snapshot only — no API calls. */
export function generateHealthSummaryPdf(input: HealthSummaryPdfInput): void {
  const now = new Date();
  const generatedLabel = `Generated: ${formatDate(now)}`;
  const doc = new jsPDF("p", "mm", "a4");
  const scoreData = input.healthScore;

  let y = drawPageHeader(doc, generatedLabel);

  y += GAP_SECTION;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setHexColor(doc, "#888888");
  doc.text("ANALYSIS SUMMARY", X_LEFT, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setHexColor(doc, "#aaaaaa");
  doc.text(formatDateTime(now), X_LEFT, y);
  y += 5;

  const banner = severityToBanner(input.severity);
  if (banner) {
    doc.setFontSize(10);
    setHexColor(doc, "#333333");
    y = drawWrappedText(doc, banner.message, X_LEFT, y, BAR_W, 4.5);
    y += 2;
  }

  y += GAP_HEADER_TO_SCORE;

  const scoreValue = displayScore(scoreData.totalScore);
  const scoreColor = getScoreColor(scoreValue);
  const scoreLabel = getScoreLabel(scoreValue);

  y = ensureSpace(doc, y, 80, generatedLabel);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setHexColor(doc, "#1a1a1a");
  doc.text("Your Health Score", CENTER_X, y, { align: "center" });
  y += 12;

  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  setHexColor(doc, scoreColor);
  doc.text(`${scoreValue}%`, CENTER_X, y, { align: "center" });
  y += 14;

  doc.setFontSize(10);
  setHexColor(doc, scoreColor);
  doc.text(scoreLabel, CENTER_X, y, { align: "center" });
  y += 8;

  if (scoreData.encouragingMessage) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    setHexColor(doc, "#888888");
    y = drawCenteredWrappedText(
      doc,
      stripPdfQuotes(scoreData.encouragingMessage),
      y,
      BAR_W,
      4
    );
    y += 2;
  }

  y += 4;

  for (let i = 0; i < scoreData.categories.length; i++) {
    const cat = scoreData.categories[i];
    y = ensureSpace(doc, y, 22, generatedLabel);

    const pct = categoryPercent(cat.score, cat.maxScore);
    const catColor = getCategoryColor(cat.status);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setHexColor(doc, "#333333");
    doc.text(cat.name, X_LEFT, y);

    doc.setFont("helvetica", "bold");
    setHexColor(doc, catColor);
    doc.text(`${pct}%`, X_RIGHT, y, { align: "right" });

    const barY = y + 4;
    const barH = 1.5;

    doc.setFillColor(230, 230, 230);
    doc.rect(X_LEFT, barY, BAR_W, barH, "F");

    const [r, g, b] = hexRgb(catColor);
    doc.setFillColor(r, g, b);
    doc.rect(X_LEFT, barY, (BAR_W * pct) / 100, barH, "F");

    y = barY + barH + 4;

    if (cat.oneLineNote) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      setHexColor(doc, "#888888");
      y = drawWrappedText(
        doc,
        stripPdfQuotes(cat.oneLineNote),
        X_LEFT,
        y,
        BAR_W,
        3.8
      );
    }

    if (i < scoreData.categories.length - 1) {
      y += GAP_CATEGORY_ROW;
    }
  }

  y += GAP_SCORE_TO_SUMMARY;

  const summaryText = stripPrismOpener(input.summary);
  if (summaryText) {
    y = ensureSpace(doc, y, 24, generatedLabel);
    y = drawSectionLabel(doc, y, "WHAT YOUR RESULTS MEAN");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    setHexColor(doc, "#333333");
    y = drawWrappedText(doc, summaryText, X_LEFT, y, BAR_W, 4.8);
    y += GAP_SECTION;
  }

  const steps = input.guide?.steps ?? [];
  if (steps.length > 0) {
    y = ensureSpace(doc, y, 20, generatedLabel);
    y = drawSectionLabel(doc, y, "YOUR ACTION PLAN");

    for (const step of steps) {
      y = drawBulletItem(doc, y, step, generatedLabel);
    }
    y += GAP_SECTION;
  }

  const questions = input.guide?.questions ?? [];
  if (questions.length > 0) {
    y = ensureSpace(doc, y, 20, generatedLabel);
    y = drawSectionLabel(doc, y, "QUESTIONS FOR YOUR DOCTOR");

    for (const q of questions) {
      y = drawQuestionItem(doc, y, q, generatedLabel);
    }
  }

  const pageCount = doc.getNumberOfPages();
  const footerTextY = FOOTER_Y - 2;

  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const footerLineY = FOOTER_Y - 10;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(X_LEFT, footerLineY, X_RIGHT, footerLineY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setHexColor(doc, "#aaaaaa");
    doc.text(
      "Generated by Prism · prism-sigma-five.vercel.app",
      X_LEFT,
      footerTextY
    );
    doc.text(
      "This is not medical advice. Always consult your doctor.",
      X_RIGHT,
      footerTextY,
      { align: "right" }
    );
  }

  doc.save(`prism-health-summary-${filenameDate(now)}.pdf`);
}
