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
import {
  buildBodyMapAnnotations,
  computeBodySystems,
  computeRegionStyles,
  findMostCriticalSystem,
  findRegionForSystem,
  getFlaggedValues,
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

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h2 className="type-h2">Body systems affected</h2>
      </div>

      <div className="flex flex-col items-start gap-8 p-6 lg:flex-row lg:items-start">
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
            />
          ) : (
            <p className="type-body text-sm">
              Tap a label or highlighted area to see what your results mean.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function RegionDetailCard({
  region,
  system,
  flagged,
}: {
  region: MapRegionId;
  system: BodySystemState;
  flagged: { name: string }[];
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
    </div>
  );
}
