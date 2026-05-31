"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type {
  BodyMapAnnotation,
  MapRegionId,
  OrganStyle,
} from "@/lib/bodySystems";
import { BODY_FIGURE } from "@/lib/bodySystems";

const ANNOTATION_ORDER: MapRegionId[] = [
  "brain",
  "heart",
  "stomach",
  "blood",
  "thyroid",
  "liver",
  "kidneys",
  "bones",
];

function annotationIndex(region: MapRegionId): number {
  const i = ANNOTATION_ORDER.indexOf(region);
  return i >= 0 ? i : 0;
}

function elbowPath(
  side: "left" | "right",
  orgX: number,
  orgY: number,
  labelX: number,
  labelY: number
): string {
  const { edgeLeft, edgeRight } = BODY_FIGURE;
  if (side === "left") {
    const bendX = edgeLeft - 6;
    const pillEndX = labelX + Math.min(edgeLeft - labelX - 4, 62);
    return `M ${orgX} ${orgY} L ${bendX} ${orgY} L ${bendX} ${labelY} L ${pillEndX} ${labelY}`;
  }
  const bendX = edgeRight + 6;
  return `M ${orgX} ${orgY} L ${bendX} ${orgY} L ${bendX} ${labelY} L ${labelX} ${labelY}`;
}

function RegionGroup({
  region,
  active,
  title,
  onSelect,
  onHover,
  onLeave,
  children,
}: {
  region: MapRegionId;
  active: boolean;
  title: string;
  onSelect: (region: MapRegionId) => void;
  onHover: (region: MapRegionId) => void;
  onLeave: () => void;
  children: ReactNode;
}) {
  return (
    <g
      className={`body-map-organ ${active ? "body-map-organ-active" : ""}`}
      data-region={region}
      aria-label={title}
      onClick={() => onSelect(region)}
      onMouseEnter={() => onHover(region)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(region)}
      onBlur={onLeave}
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
    stroke: active ? "#E8EAF2" : "transparent",
    strokeWidth: active ? 1.5 : 0,
  };
}

function ScanGrid({ panelX, panelY, panelW, panelH }: {
  panelX: number;
  panelY: number;
  panelW: number;
  panelH: number;
}) {
  const lines: ReactNode[] = [];
  for (let y = panelY; y <= panelY + panelH; y += 20) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={panelX}
        y1={y}
        x2={panelX + panelW}
        y2={y}
        stroke="rgba(78, 203, 168, 0.04)"
        strokeWidth={0.5}
      />
    );
  }
  for (let x = panelX; x <= panelX + panelW; x += 20) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={panelY}
        x2={x}
        y2={panelY + panelH}
        stroke="rgba(78, 203, 168, 0.04)"
        strokeWidth={0.5}
      />
    );
  }
  return <g>{lines}</g>;
}

function DiagnosisAnnotation({
  annotation,
  index,
  hovered,
  onSelect,
  onHover,
  onLeave,
}: {
  annotation: BodyMapAnnotation;
  index: number;
  hovered: boolean;
  onSelect: (region: MapRegionId) => void;
  onHover: (region: MapRegionId) => void;
  onLeave: () => void;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [lineDrawn, setLineDrawn] = useState(false);
  const { organX, organY, labelX, labelY, side, statusColor, statusLabel, title, region } =
    annotation;
  const isCritical = statusLabel === "Critical";
  const pathD = elbowPath(side, organX, organY, labelX, labelY);
  const dotDelay = index * 150;
  const lineDelay = dotDelay + 100;
  const { edgeLeft, edgeRight } = BODY_FIGURE;
  const maxPillW =
    side === "left"
      ? edgeLeft - labelX - 4
      : 440 - labelX - 4;
  const pillW = Math.min(
    maxPillW,
    Math.max(56, title.length * 6 + 12)
  );
  const pillH = 34;
  const pillX = labelX;
  const pillY = labelY - pillH / 2;
  const lineEndX = side === "left" ? pillX + pillW : pillX;

  useLayoutEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") onSelect(region);
  };

  return (
    <g
      className="cursor-pointer"
      onClick={() => onSelect(region)}
      onMouseEnter={() => onHover(region)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(region)}
      onBlur={onLeave}
      role="button"
      tabIndex={0}
      onKeyDown={handleKey}
    >
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={statusColor}
        strokeWidth={hovered ? 1.5 : 1}
        strokeOpacity={hovered ? 1 : 0.85}
        className={`body-map-annotation-line ${hovered ? "is-hovered" : ""} ${!lineDrawn && pathLen > 0 ? "body-map-line-draw" : ""}`}
        strokeDasharray={lineDrawn ? "5 3" : `${pathLen} ${pathLen}`}
        strokeDashoffset={lineDrawn ? 0 : pathLen}
        style={
          {
            "--path-len": pathLen,
            animationDelay: `${lineDelay}ms`,
          } as CSSProperties
        }
        onAnimationEnd={() => setLineDrawn(true)}
      />

      {/* Organ endpoint — glowing dot */}
      <g
        className="body-map-dot-enter"
        style={{ animationDelay: `${dotDelay}ms` }}
      >
        <circle
          cx={organX}
          cy={organY}
          r={5}
          fill={statusColor}
          fillOpacity={0.2}
          className={`body-map-endpoint-halo ${hovered ? "is-hovered" : ""} ${isCritical ? "body-map-dot-halo-critical" : ""}`}
        />
        <circle
          cx={organX}
          cy={organY}
          r={2.5}
          fill={statusColor}
          fillOpacity={0.9}
        />
      </g>

      {/* Label endpoint dot — sits at pill edge, not on body */}
      <circle cx={lineEndX} cy={labelY} r={2} fill={statusColor} />

      {/* Label pill — rendered in margin, never on the body */}
      <foreignObject
        x={pillX}
        y={pillY}
        width={pillW}
        height={pillH}
        style={{ overflow: "visible", pointerEvents: "none" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: side === "left" ? "0 6px 0 8px" : "0 8px 0 6px",
            background: "#252830",
            border: `0.5px solid ${statusColor}${hovered ? "cc" : "55"}`,
            borderRadius: 6,
            boxShadow: hovered
              ? `0 0 12px ${statusColor}40`
              : "0 2px 8px rgba(0,0,0,0.35)",
            textAlign: side === "left" ? "right" : "left",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              letterSpacing: 0.4,
              color: statusColor,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              color: "#8E92A8",
              lineHeight: 1.2,
              marginTop: 1,
              whiteSpace: "nowrap",
            }}
          >
            {statusLabel}
          </span>
        </div>
      </foreignObject>
    </g>
  );
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
  const [hoveredRegion, setHoveredRegion] = useState<MapRegionId | null>(null);
  const { panelX, panelY, panelW, panelH, x, y, width, height } = BODY_FIGURE;

  const s = (id: MapRegionId) => regionStyles[id];
  const active = (id: MapRegionId) => selectedRegion === id;

  const onHover = useCallback((region: MapRegionId) => {
    setHoveredRegion(region);
  }, []);

  const onLeave = useCallback(() => {
    setHoveredRegion(null);
  }, []);

  const sortedAnnotations = [...annotations].sort(
    (a, b) => annotationIndex(a.region) - annotationIndex(b.region)
  );

  return (
    <svg
      viewBox="0 0 440 560"
      width={380}
      height={484}
      className="body-map-fade-in shrink-0 relative"
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
        <clipPath id="body-panel-clip">
          <rect x={panelX} y={panelY} width={panelW} height={panelH} rx={6} />
        </clipPath>
      </defs>

      <rect width="440" height="560" fill="#191B22" rx="4" />

      {/* Body illustration panel */}
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

      {/* X-ray grid overlay */}
      <g clipPath="url(#body-panel-clip)">
        <ScanGrid
          panelX={panelX}
          panelY={panelY}
          panelW={panelW}
          panelH={panelH}
        />
        <line
          x1={panelX}
          y1={panelY}
          x2={panelX + panelW}
          y2={panelY}
          stroke="rgba(78, 203, 168, 0.06)"
          strokeWidth={1}
          className="body-map-scanline"
          style={{ transformOrigin: `${panelX}px ${panelY}px` }}
        />
      </g>

      {/* Organ markers — clipped to body panel so glow stays on the figure */}
      <g clipPath="url(#body-panel-clip)" filter="url(#organ-glow)">
        <RegionGroup
          region="brain"
          active={active("brain")}
          title="Brain"
          onSelect={onSelectRegion}
          onHover={onHover}
          onLeave={onLeave}
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
          onHover={onHover}
          onLeave={onLeave}
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
          onHover={onHover}
          onLeave={onLeave}
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
          onHover={onHover}
          onLeave={onLeave}
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
          onHover={onHover}
          onLeave={onLeave}
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
          onHover={onHover}
          onLeave={onLeave}
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
          onHover={onHover}
          onLeave={onLeave}
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
          onHover={onHover}
          onLeave={onLeave}
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

      {/* X-ray diagnostic annotations — labels live in side margins only */}
      <g>
        {sortedAnnotations.map((a) => (
          <DiagnosisAnnotation
            key={a.region}
            annotation={a}
            index={annotationIndex(a.region)}
            hovered={hoveredRegion === a.region}
            onSelect={onSelectRegion}
            onHover={onHover}
            onLeave={onLeave}
          />
        ))}
      </g>
    </svg>
  );
}
