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

function organPaint(style: OrganStyle, active: boolean) {
  const isCritical = style.visual === "hh" || style.visual === "ll";
  return {
    fill: style.fill,
    fillOpacity: style.fillOpacity,
    stroke: active ? "#FFFFFF" : style.stroke,
    strokeWidth: active ? 1.5 : 1,
    strokeOpacity: active ? 1 : 0.8,
    ...(isCritical && !active ? {} : {}),
  };
}

function CriticalGlow({
  style,
  glow,
  children,
}: {
  style: OrganStyle;
  glow: ReactNode;
  children: ReactNode;
}) {
  const isCritical = style.visual === "hh" || style.visual === "ll";
  if (!isCritical) return <>{children}</>;
  return (
    <g>
      <g fill={style.fill} fillOpacity={0.12} stroke="none">
        {glow}
      </g>
      {children}
    </g>
  );
}

function annotationLine(
  side: "left" | "right",
  labelX: number,
  labelY: number,
  organX: number,
  organY: number
) {
  const labelEdge = side === "left" ? labelX + 56 : labelX - 56;
  const bodyEdge = side === "left" ? 72 : 208;
  const x2 = side === "left" ? Math.min(organX, bodyEdge) : Math.max(organX, bodyEdge);
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

  return (
    <svg
      viewBox={`0 0 ${BODY_FIGURE.width} ${BODY_FIGURE.height}`}
      width={280}
      height={560}
      className="body-map-fade-in shrink-0"
      aria-label="Body systems diagram"
    >
      <rect width={280} height={560} fill="#0F1117" rx={8} />

      {/* Body silhouette */}
      <g fill="transparent" stroke="#454760" strokeWidth={1.5}>
        <ellipse cx={140} cy={52} rx={32} ry={38} />
        <rect x={126} y={86} width={28} height={22} rx={8} />
        <path d="M95 108 Q118 100 140 108 Q162 100 185 108" />
        <path
          d="M95 108 Q82 150 72 195 Q68 240 65 285 Q64 295 68 300
             M185 108 Q198 150 208 195 Q212 240 215 285 Q216 295 212 300"
        />
        <path
          d="M100 108 Q90 170 88 230 Q85 270 88 310
             L192 310 Q195 270 190 230 Q188 170 180 108
             Q160 104 140 106 Q120 104 100 108 Z"
        />
        <path
          d="M88 310 Q92 360 95 420 Q94 470 90 520 Q88 535 100 540
             M192 310 Q188 360 185 420 Q186 470 190 520 Q192 535 180 540"
        />
        <ellipse cx={98} cy={542} rx={18} ry={8} />
        <ellipse cx={182} cy={542} rx={18} ry={8} />
      </g>

      {/* Internal detail lines */}
      <g stroke="#2a2a3a" strokeWidth={0.5} fill="none">
        <path d="M108 118 Q140 122 172 118" />
        <line x1={140} y1={118} x2={140} y2={200} />
        <path d="M102 145 Q140 150 178 145" />
        <path d="M100 175 Q140 180 180 175" />
        <path d="M98 205 Q140 210 182 205" />
        <path d="M96 248 Q140 252 184 248" />
        <path d="M94 262 Q140 266 186 262" />
      </g>

      {/* Blood / metabolism torso tint */}
      <RegionGroup
        region="blood"
        active={active("blood")}
        title="Blood & metabolism"
        onSelect={onSelectRegion}
      >
        <rect
          x={96}
          y={118}
          width={88}
          height={130}
          rx={20}
          {...organPaint(s("blood"), active("blood"))}
          opacity={0.85}
        />
      </RegionGroup>

      {/* Organ overlays */}
      <g filter="url(#organ-glow)">
        <defs>
          <filter id="organ-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <RegionGroup
          region="brain"
          active={active("brain")}
          title="Brain"
          onSelect={onSelectRegion}
        >
          <CriticalGlow
            style={s("brain")}
            glow={<ellipse cx={140} cy={44} rx={32} ry={34} />}
          >
            <ellipse cx={140} cy={44} rx={28} ry={30} {...organPaint(s("brain"), active("brain"))} />
          </CriticalGlow>
        </RegionGroup>

        <RegionGroup
          region="thyroid"
          active={active("thyroid")}
          title="Thyroid"
          onSelect={onSelectRegion}
        >
          <CriticalGlow
            style={s("thyroid")}
            glow={
              <>
                <ellipse cx={133} cy={96} rx={11} ry={13} />
                <ellipse cx={147} cy={96} rx={11} ry={13} />
              </>
            }
          >
            <ellipse cx={133} cy={96} rx={9} ry={11} {...organPaint(s("thyroid"), active("thyroid"))} />
            <ellipse cx={147} cy={96} rx={9} ry={11} {...organPaint(s("thyroid"), active("thyroid"))} />
          </CriticalGlow>
        </RegionGroup>

        <RegionGroup
          region="heart"
          active={active("heart")}
          title="Heart"
          onSelect={onSelectRegion}
        >
          <CriticalGlow
            style={s("heart")}
            glow={
              <path d="M125 148 C116 136 104 140 104 152 C104 168 125 180 125 180 C125 180 146 168 146 152 C146 140 134 136 125 148 Z" />
            }
          >
            <path
              d="M125 148 C118 138 108 142 108 152 C108 164 125 176 125 176 C125 176 142 164 142 152 C142 142 132 138 125 148 Z"
              {...organPaint(s("heart"), active("heart"))}
            />
          </CriticalGlow>
        </RegionGroup>

        <RegionGroup
          region="liver"
          active={active("liver")}
          title="Liver"
          onSelect={onSelectRegion}
        >
          <CriticalGlow
            style={s("liver")}
            glow={<rect x={150} y={163} width={36} height={40} rx={12} />}
          >
            <rect
              x={152}
              y={165}
              width={32}
              height={36}
              rx={10}
              {...organPaint(s("liver"), active("liver"))}
            />
          </CriticalGlow>
        </RegionGroup>

        <RegionGroup
          region="stomach"
          active={active("stomach")}
          title="Digestion"
          onSelect={onSelectRegion}
        >
          <CriticalGlow
            style={s("stomach")}
            glow={<ellipse cx={128} cy={200} rx={22} ry={20} />}
          >
            <ellipse cx={128} cy={200} rx={18} ry={16} {...organPaint(s("stomach"), active("stomach"))} />
          </CriticalGlow>
        </RegionGroup>

        <RegionGroup
          region="kidneys"
          active={active("kidneys")}
          title="Kidneys"
          onSelect={onSelectRegion}
        >
          <CriticalGlow
            style={s("kidneys")}
            glow={
              <>
                <ellipse cx={115} cy={228} rx={16} ry={21} />
                <ellipse cx={165} cy={228} rx={16} ry={21} />
              </>
            }
          >
            <ellipse cx={115} cy={228} rx={12} ry={17} {...organPaint(s("kidneys"), active("kidneys"))} />
            <ellipse cx={165} cy={228} rx={12} ry={17} {...organPaint(s("kidneys"), active("kidneys"))} />
          </CriticalGlow>
        </RegionGroup>

        <RegionGroup
          region="bones"
          active={active("bones")}
          title="Minerals"
          onSelect={onSelectRegion}
        >
          <CriticalGlow
            style={s("bones")}
            glow={
              <>
                <ellipse cx={108} cy={420} rx={18} ry={46} />
                <ellipse cx={172} cy={420} rx={18} ry={46} />
              </>
            }
          >
            <ellipse cx={108} cy={420} rx={14} ry={42} {...organPaint(s("bones"), active("bones"))} />
            <ellipse cx={172} cy={420} rx={14} ry={42} {...organPaint(s("bones"), active("bones"))} />
          </CriticalGlow>
        </RegionGroup>
      </g>

      {/* Annotations */}
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
                stroke="#454760"
                strokeWidth={0.8}
              />
              <circle cx={line.x2} cy={line.y2} r={2.5} fill={a.statusColor} />
              <text
                x={a.labelX}
                y={a.labelY - 4}
                fill={a.statusColor}
                fontSize={11}
                fontWeight={500}
                fontFamily="var(--font-inter), Inter, sans-serif"
                textAnchor={textAnchor}
              >
                {a.title}
              </text>
              <text
                x={a.labelX}
                y={a.labelY + 12}
                fill={a.statusColor}
                fillOpacity={0.7}
                fontSize={10}
                fontFamily="var(--font-inter), Inter, sans-serif"
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
