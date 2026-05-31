"use client";

import { useEffect, useState } from "react";
import type { CategoryStatus, ScoreResult } from "@/lib/types";
import { SectionInfoButton } from "./SectionInfoButton";
import { InfoBullet } from "./InfoBullet";

interface HealthScoreCardProps {
  score: ScoreResult | null;
}

const GAUGE_SIZE = 220;
const STROKE_WIDTH = 10;
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CX = GAUGE_SIZE / 2;
const CY = GAUGE_SIZE / 2;

function getScoreColor(total: number): string {
  if (total >= 80) return "#4ECBA8";
  if (total >= 60) return "#D4956A";
  if (total >= 40) return "#C4617A";
  return "#A84455";
}

function getScoreLabel(total: number): string {
  if (total >= 80) return "Your health looks strong";
  if (total >= 60) return "A few things to work on";
  if (total >= 40) return "Needs some attention";
  return "Important to see a doctor";
}

function getCategoryColor(status: CategoryStatus): string {
  if (status === "good") return "#4ECBA8";
  if (status === "fair") return "#D4956A";
  return "#C4617A";
}

function displayScore(raw: number): number {
  return Math.max(12, Math.round(raw));
}

function categoryPercent(score: number, maxScore: number): number {
  return Math.round((score / maxScore) * 100);
}

export function HealthScoreCard({ score }: HealthScoreCardProps) {
  const [visible, setVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [arcOffset, setArcOffset] = useState(CIRCUMFERENCE);
  const [barWidths, setBarWidths] = useState<number[]>([0, 0, 0, 0]);

  const finalScore = score ? displayScore(score.totalScore) : 0;
  const arcColor = getScoreColor(finalScore);
  const scoreLabel = getScoreLabel(finalScore);
  const targetOffset = CIRCUMFERENCE - (finalScore / 100) * CIRCUMFERENCE;

  useEffect(() => {
    if (!score) return;

    const fadeTimer = requestAnimationFrame(() => setVisible(true));
    const arcTimer = setTimeout(() => setArcOffset(targetOffset), 50);

    const countSteps = Math.ceil(finalScore / 2);
    let step = 0;
    const countInterval = setInterval(() => {
      step++;
      setAnimatedScore(
        Math.min(finalScore, Math.round((step / countSteps) * finalScore))
      );
      if (step >= countSteps) clearInterval(countInterval);
    }, 50);

    const barTimers = score.categories.map((cat, i) =>
      setTimeout(() => {
        setBarWidths((prev) => {
          const next = [...prev];
          next[i] = (cat.score / cat.maxScore) * 100;
          return next;
        });
      }, 100 + i * 100)
    );

    return () => {
      cancelAnimationFrame(fadeTimer);
      clearTimeout(arcTimer);
      clearInterval(countInterval);
      barTimers.forEach(clearTimeout);
    };
  }, [score, finalScore, targetOffset]);

  if (!score) return null;

  return (
    <div
      className="transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <section className="card-surface">
        <div className="section-title-row mb-6">
          <h2 className="type-section-title">Your health score</h2>
          <SectionInfoButton
            modalTitle="How your score is calculated"
            ariaLabel="How your score is calculated"
            disclaimer="Scores are estimated by Gemini AI and are for informational purposes only."
          >
            <p>
              Your health score gives you a quick sense of how your results look
              overall. It is not a medical diagnosis — just a helpful snapshot.
            </p>
            <p>The score is split into 4 areas, each worth up to 25 points:</p>
            <InfoBullet>Heart health — cholesterol, inflammation, cardiovascular markers</InfoBullet>
            <InfoBullet>Metabolic health — blood sugar, thyroid, insulin levels</InfoBullet>
            <InfoBullet>Nutritional health — iron, vitamins, and minerals</InfoBullet>
            <InfoBullet>Organ health — liver and kidney function</InfoBullet>
            <p>
              Flagged values lower the score in their category. The further a
              value is from normal, the more it affects the score.
            </p>
            <p>
              Categories not tested in your report are assumed average (20/25).
            </p>
          </SectionInfoButton>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex w-full flex-col items-center md:w-[40%]">
            <div
              className="relative"
              style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}
            >
              <svg
                width={GAUGE_SIZE}
                height={GAUGE_SIZE}
                viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
                className="-rotate-90"
                aria-hidden
              >
                <circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth={STROKE_WIDTH}
                />
                <circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke={arcColor}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={arcOffset}
                  style={{ transition: "stroke-dashoffset 1000ms ease-out" }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="inline-flex items-start leading-none">
                  <span
                    style={{
                      fontSize: 64,
                      fontFamily:
                        'var(--font-mono), "JetBrains Mono", monospace',
                      fontWeight: 700,
                      letterSpacing: "-2px",
                      color: arcColor,
                      lineHeight: 1,
                    }}
                  >
                    {animatedScore}
                  </span>
                  <span
                    style={{
                      fontSize: 26,
                      fontFamily:
                        'var(--font-mono), "JetBrains Mono", monospace',
                      fontWeight: 500,
                      color: arcColor,
                      opacity: 0.7,
                      lineHeight: 1,
                      marginTop: 6,
                      marginLeft: 1,
                    }}
                  >
                    %
                  </span>
                </div>
                <span
                  className="text-center uppercase"
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontWeight: 500,
                    letterSpacing: "0.8px",
                    color: arcColor,
                    opacity: 0.6,
                    maxWidth: 140,
                  }}
                >
                  {scoreLabel}
                </span>
              </div>
            </div>

            <p
              className="mt-4 text-center italic"
              style={{
                fontSize: 15,
                fontFamily: "var(--font-inter), Inter, sans-serif",
                color: "var(--text-tertiary)",
                maxWidth: 200,
              }}
            >
              {score.encouragingMessage}
            </p>
          </div>

          <div className="flex w-full flex-col md:w-[60%] md:pt-1">
            {score.categories.map((cat, i) => {
              const catColor = getCategoryColor(cat.status);
              return (
                <div
                  key={cat.name}
                  style={{
                    marginBottom: i < score.categories.length - 1 ? 24 : 0,
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      style={{
                        fontSize: 15,
                        fontFamily: "var(--font-inter), Inter, sans-serif",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                      }}
                    >
                      {cat.name}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontFamily:
                          'var(--font-mono), "JetBrains Mono", monospace',
                        fontWeight: 600,
                        color: catColor,
                      }}
                    >
                      {categoryPercent(cat.score, cat.maxScore)}%
                    </span>
                  </div>
                  <div
                    className="overflow-hidden rounded-full"
                    style={{ height: 4, background: "var(--border)" }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidths[i]}%`,
                        background: catColor,
                        borderRadius: 99,
                        transition: "width 600ms ease-out",
                      }}
                    />
                  </div>
                  <p
                    className="mt-1.5 italic"
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {cat.oneLineNote}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <p
        className="mb-5 text-center"
        style={{
          fontSize: 12,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          color: "var(--text-tertiary)",
        }}
      >
        Estimated wellness snapshot · Not a medical diagnosis
      </p>
    </div>
  );
}
