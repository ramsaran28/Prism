"use client";

import type { ReactNode } from "react";
import type {
  BodyMapAnnotation,
  MapRegionId,
  OrganStyle,
} from "@/lib/bodySystems";
import { BODY_FIGURE } from "@/lib/bodySystems";

function RegionGroup({
  region,
  active,
  title,
  onSelect,
  children,
}: {
  region: MapRegionId;
  active: boolean;
  title: string;
  onSelect: (region: MapRegionId) => void;
  children: ReactNode;
}) {
  return (
    <g
      className={`body-map-organ ${active ? "body-map-organ-active" : ""}`}
      data-region={region}
      aria-label={title}
      onClick={() => onSelect(region)}
      style={{ pointerEvents: "all", cursor: "pointer" }}
    >
      <title>{title}</title>
      {children}
    </g>
  );
}

function glowPaint(style: OrganStyle, active: boolean) {
  return {
    fill: style.fill,
    fillOpacity: style.fillOpacity,
    stroke: active ? "#F0EEF8" : "transparent",
    strokeWidth: active ? 1.5 : 0,
  };
}

function annotationLine(
  side: "left" | "right",
  labelX: number,
  labelY: number,
  organX: number,
  organY: number
): { x1: number; y1: number; x2: number; y2: number } {
  const { panelX, panelY, panelW, panelH } = BODY_FIGURE;
  const bodyEdge =
    side === "left" ? panelX + 4 : panelX + panelW - 4;
  const labelEdge = side === "left" ? labelX + 72 : labelX - 72;
  const x2 =
    side === "left" ? Math.min(organX, bodyEdge) : Math.max(organX, bodyEdge);
  return { x1: labelEdge, y1: labelY, x2, y2: organY };
}

interface BodyAnatomySvgProps {
  regionStyles: Record<MapRegionId, OrganStyle>;
  selectedRegion: MapRegionId | null;
  annotations: BodyMapAnnotation[];
  onSelectRegion: (region: MapRegionId) => void;
}

export function BodyAnatomySvg({
  regionStyles,
  selectedRegion,
  annotations,
  onSelectRegion,
}: BodyAnatomySvgProps) {
  const s = (id: MapRegionId) => regionStyles[id];
  const active = (id: MapRegionId) => selectedRegion === id;
  const { panelX, panelY, panelW, panelH, x, y, width, height } = BODY_FIGURE;

  return (
    <svg
      viewBox="0 0 440 560"
      width={380}
      height={484}
      className="body-map-fade-in shrink-0"
      aria-label="Body systems diagram"
    >
      <defs>
        <filter id="organ-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="440" height="560" fill="#0F0F14" rx="4" />

      {/* Light panel — shows the uploaded illustration as-is (white bg) */}
      <rect
        x={panelX}
        y={panelY}
        width={panelW}
        height={panelH}
        fill="#ffffff"
        rx="6"
      />
      <image
        href="/body-anatomy-front.png"
        x={x}
        y={y}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Small organ markers — no text on the body */}
      <g filter="url(#organ-glow)">
        <RegionGroup
          region="brain"
          active={active("brain")}
          title="Brain"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="220"
            cy="50"
            rx="16"
            ry="18"
            {...glowPaint(s("brain"), active("brain"))}
          />
        </RegionGroup>

        <RegionGroup
          region="thyroid"
          active={active("thyroid")}
          title="Thyroid"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="212"
            cy="98"
            rx="7"
            ry="6"
            {...glowPaint(s("thyroid"), active("thyroid"))}
          />
          <ellipse
            cx="228"
            cy="98"
            rx="7"
            ry="6"
            {...glowPaint(s("thyroid"), active("thyroid"))}
          />
        </RegionGroup>

        <RegionGroup
          region="heart"
          active={active("heart")}
          title="Heart"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="198"
            cy="150"
            rx="12"
            ry="14"
            {...glowPaint(s("heart"), active("heart"))}
          />
        </RegionGroup>

        <RegionGroup
          region="liver"
          active={active("liver")}
          title="Liver"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="252"
            cy="170"
            rx="14"
            ry="11"
            {...glowPaint(s("liver"), active("liver"))}
          />
        </RegionGroup>

        <RegionGroup
          region="stomach"
          active={active("stomach")}
          title="Digestion"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="208"
            cy="220"
            rx="13"
            ry="11"
            {...glowPaint(s("stomach"), active("stomach"))}
          />
        </RegionGroup>

        <RegionGroup
          region="kidneys"
          active={active("kidneys")}
          title="Kidneys"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="188"
            cy="254"
            rx="9"
            ry="12"
            {...glowPaint(s("kidneys"), active("kidneys"))}
          />
          <ellipse
            cx="252"
            cy="254"
            rx="9"
            ry="12"
            {...glowPaint(s("kidneys"), active("kidneys"))}
          />
        </RegionGroup>

        <RegionGroup
          region="blood"
          active={active("blood")}
          title="Blood"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="220"
            cy="290"
            rx="16"
            ry="9"
            {...glowPaint(s("blood"), active("blood"))}
          />
        </RegionGroup>

        <RegionGroup
          region="bones"
          active={active("bones")}
          title="Minerals"
          onSelect={onSelectRegion}
        >
          <ellipse
            cx="188"
            cy="400"
            rx="10"
            ry="38"
            {...glowPaint(s("bones"), active("bones"))}
          />
          <ellipse
            cx="252"
            cy="400"
            rx="10"
            ry="38"
            {...glowPaint(s("bones"), active("bones"))}
          />
        </RegionGroup>
      </g>

      {/* Side labels */}
      <g>
        {annotations.map((a) => {
          const line = annotationLine(
            a.side,
            a.labelX,
            a.labelY,
            a.organX,
            a.organY
          );
          const textAnchor = a.side === "left" ? "start" : "end";

          return (
            <g
              key={a.region}
              className="cursor-pointer"
              onClick={() => onSelectRegion(a.region)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectRegion(a.region);
              }}
            >
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#2A2A3E"
                strokeWidth="0.75"
              />
              <circle cx={line.x2} cy={line.y2} r="2" fill="#4E4C5E" />
              <text
                x={a.labelX}
                y={a.labelY - 6}
                fill="#F0EEF8"
                fontSize="13"
                fontWeight="500"
                fontFamily="system-ui, sans-serif"
                textAnchor={textAnchor}
              >
                {a.title}
              </text>
              <text
                x={a.labelX}
                y={a.labelY + 10}
                fill={a.statusColor}
                fontSize="11"
                fontWeight="400"
                fontFamily="system-ui, sans-serif"
                textAnchor={textAnchor}
              >
                {a.statusLabel}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
