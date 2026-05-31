"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bone,
  Brain,
  Droplets,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { getValueLabel } from "@/lib/labValueNames";
import type { LabValue, RiskResult } from "@/lib/types";
import { BodyAnatomySvg } from "./BodyAnatomySvg";
import { InfoBullet } from "./InfoBullet";
import { SectionInfoButton } from "./SectionInfoButton";
import {
  buildBodyMapAnnotations,
  computeBodySystems,
  computeRegionStyles,
  findMostCriticalSystem,
  findRegionForSystem,
  getFlaggedValues,
  getMostCriticalFlaggedValue,
  getPersonalClosing,
  getSeverityBadge,
  REGION_INTRO,
  REGION_LABELS,
  REGION_TO_SYSTEM,
  statusBadge,
  type BodySystemState,
  type MapRegionId,
  type OrganStyle,
} from "@/lib/bodySystems";
import { FlagExplainModal } from "./FlagExplainModal";

interface BodySystemsMapProps {
  values: LabValue[];
  risk: RiskResult | null;
}

const REGION_ICONS: Record<MapRegionId, LucideIcon> = {
  brain: Brain,
  thyroid: Activity,
  heart: Heart,
  liver: Droplets,
  kidneys: Droplets,
  stomach: Droplets,
  blood: Droplets,
  bones: Bone,
};

export function BodySystemsMap({ values, risk }: BodySystemsMapProps) {
  const flagged = useMemo(
    () => risk?.flaggedValues ?? [],
    [risk?.flaggedValues]
  );

  const computedKey = useMemo(
    () => `${values.length}-${JSON.stringify(flagged)}`,
    [values, flagged]
  );

  const [systems, setSystems] = useState<BodySystemState[]>([]);
  const [regionStyles, setRegionStyles] = useState<
    Record<MapRegionId, OrganStyle>
  >(() => computeRegionStyles(computeBodySystems([], [])));
  const [annotations, setAnnotations] = useState(buildBodyMapAnnotations([]));
  const [selectedRegion, setSelectedRegion] = useState<MapRegionId | null>(
    null
  );
  const [explainValue, setExplainValue] = useState<LabValue | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const lastComputedKey = useRef("");

  useEffect(() => {
    if (!values.length) return;
    const next = computeBodySystems(values, flagged);
    const styles = computeRegionStyles(next);
    setSystems(next);
    setRegionStyles(styles);
    setAnnotations(buildBodyMapAnnotations(next));

    if (lastComputedKey.current !== computedKey) {
      lastComputedKey.current = computedKey;
      const criticalId = findMostCriticalSystem(next);
      if (criticalId) {
        setSelectedRegion(findRegionForSystem(criticalId));
      }
    }
  }, [computedKey, values, flagged]);

  if (!values.length) return null;

  const selectedSystem = selectedRegion
    ? systems.find((s) => s.id === REGION_TO_SYSTEM[selectedRegion])
    : null;

  function relatedFlagged(current: LabValue): LabValue[] {
    return values
      .filter(
        (v) =>
          v.status !== "normal" &&
          (v.medicalName ?? v.name) !== (current.medicalName ?? current.name)
      )
      .slice(0, 3);
  }

  function openExplainForSystem(system: BodySystemState) {
    const critical = getMostCriticalFlaggedValue(system, flagged);
    if (critical) {
      setExplainValue(critical);
      setExplainOpen(true);
    }
  }

  return (
    <section className="card-surface overflow-hidden !p-0">
      <div className="border-b border-border px-7 py-5">
        <div className="section-title-row">
          <h2 className="type-h2">Body systems affected</h2>
          <SectionInfoButton
            modalTitle="How to use the body map"
            ariaLabel="How to use the body map"
          >
            <p>
              This map shows which parts of your body may be affected based on
              your lab results.
            </p>
            <p>The color of each organ tells you its status:</p>
            <InfoBullet color="#00C896">Green — values in this area look healthy</InfoBullet>
            <InfoBullet color="#F0A500">Amber — one or more values need attention</InfoBullet>
            <InfoBullet color="#F04060">Red — values here need prompt care</InfoBullet>
            <InfoBullet color="#454760">Gray — this area wasn&apos;t tested</InfoBullet>
            <p>
              Click any organ on the body to see the specific values related to
              it and what they mean in plain language.
            </p>
          </SectionInfoButton>
        </div>
      </div>

      <div className="flex flex-col items-start gap-8 p-7 lg:flex-row lg:items-start">
        <BodyAnatomySvg
          regionStyles={regionStyles}
          selectedRegion={selectedRegion}
          annotations={annotations}
          onSelectRegion={setSelectedRegion}
        />

        <div className="min-w-0 flex-1 lg:max-w-md">
          {selectedRegion && selectedSystem ? (
            <RegionDetailCard
              region={selectedRegion}
              system={selectedSystem}
              flagged={flagged}
              onAskWhy={() => openExplainForSystem(selectedSystem)}
              hasFlaggedValue={
                getMostCriticalFlaggedValue(selectedSystem, flagged) !== null
              }
            />
          ) : (
            <p className="type-body text-sm">
              Tap a label or highlighted area to see what your results mean.
            </p>
          )}
        </div>
      </div>

      <FlagExplainModal
        open={explainOpen}
        onClose={() => {
          setExplainOpen(false);
          setExplainValue(null);
        }}
        value={explainValue}
        relatedFlagged={explainValue ? relatedFlagged(explainValue) : []}
      />
    </section>
  );
}

function RegionDetailCard({
  region,
  system,
  flagged,
  onAskWhy,
  hasFlaggedValue,
}: {
  region: MapRegionId;
  system: BodySystemState;
  flagged: { name: string }[];
  onAskWhy: () => void;
  hasFlaggedValue: boolean;
}) {
  const Icon = REGION_ICONS[region];
  const badge = getSeverityBadge(system.visual);
  const flaggedValues = getFlaggedValues(system, flagged);
  const intro = REGION_INTRO[region];
  const closing = getPersonalClosing(system, flagged);

  return (
    <div className="card-surface bg-card-hover px-6 py-5">
      <div className="mb-4 flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
        <h3 className="type-h2 text-base">{REGION_LABELS[region]}</h3>
        <span className={`ml-auto ${badge.className}`}>{badge.label}</span>
      </div>

      <p className="type-body mb-4 text-[15px]">{intro}</p>

      {flaggedValues.length > 0 ? (
        <ul className="mb-4 space-y-2.5 border-t border-border pt-4">
          {flaggedValues.map((v) => {
            const b = statusBadge(v.status);
            return (
              <li
                key={`${v.name}-${v.result}`}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
              >
                <span className="text-text-primary">{getValueLabel(v)}</span>
                <span className="value-mono text-text-secondary">
                  {v.result}
                  {v.unit ? ` ${v.unit}` : ""}
                </span>
                <span className={b.className}>{b.label}</span>
              </li>
            );
          })}
        </ul>
      ) : system.values.length > 0 ? (
        <p className="type-body mb-4 border-t border-border pt-4 text-sm">
          No flagged results in this area.
        </p>
      ) : (
        <p className="type-body mb-4 border-t border-border pt-4 text-sm">
          No related tests in your report.
        </p>
      )}

      <p className="type-action text-[15px]">{closing}</p>

      {hasFlaggedValue && (
        <button
          type="button"
          onClick={onAskWhy}
          className="mt-3 block text-left hover:underline"
          style={{
            fontSize: 12,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            color: "#00C896",
            cursor: "pointer",
            marginTop: 12,
          }}
        >
          Ask Prism why →
        </button>
      )}
    </div>
  );
}
