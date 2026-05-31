import { getValueLabel } from "@/lib/labValueNames";
import type { LabValue, ValueStatus } from "@/lib/types";

function matchName(value: LabValue): string {
  return value.medicalName ?? value.name;
}

export type BodySystemId =
  | "brain"
  | "thyroid"
  | "heart"
  | "liver"
  | "kidneys"
  | "blood"
  | "bones";

/** Eight clickable regions on the diagram (4 left, 4 right). */
export type MapRegionId =
  | "brain"
  | "heart"
  | "stomach"
  | "blood"
  | "thyroid"
  | "liver"
  | "kidneys"
  | "bones";

export const REGION_TO_SYSTEM: Record<MapRegionId, BodySystemId> = {
  brain: "brain",
  heart: "heart",
  stomach: "blood",
  blood: "blood",
  thyroid: "thyroid",
  liver: "liver",
  kidneys: "kidneys",
  bones: "bones",
};

export type OrganVisualSeverity = "hh" | "h_or_l" | "ll" | "normal" | "absent";

export type SystemSeverity = "critical" | "warning" | "normal" | "none";

export const SYSTEM_MAPPING: Record<BodySystemId, string[]> = {
  brain: ["TSH", "FT4", "FT3", "Anti-TPO", "Vitamin B12"],
  thyroid: ["TSH", "FT4", "FT3", "Anti-TPO"],
  heart: [
    "LDL",
    "HDL",
    "Total Cholesterol",
    "Triglycerides",
    "hs-CRP",
    "ApoB",
    "Lp(a)",
    "TC/HDL Ratio",
  ],
  liver: [
    "SGOT",
    "SGPT",
    "AST",
    "ALT",
    "GGT",
    "Alkaline Phosphatase",
    "Bilirubin",
    "Albumin",
  ],
  kidneys: [
    "Creatinine",
    "eGFR",
    "BUN",
    "Microalbumin",
    "Uric Acid",
    "Sodium",
    "Potassium",
  ],
  blood: [
    "Hemoglobin",
    "WBC",
    "RBC",
    "Platelets",
    "HbA1c",
    "Glucose",
    "Iron",
    "Ferritin",
    "Vitamin D",
    "Vitamin B12",
    "Folate",
  ],
  bones: ["Vitamin D", "Calcium", "Magnesium", "Phosphorus"],
};

export const REGION_LABELS: Record<MapRegionId, string> = {
  brain: "Brain",
  heart: "Heart",
  stomach: "Digestion",
  blood: "Blood",
  thyroid: "Thyroid",
  liver: "Liver",
  kidneys: "Kidneys",
  bones: "Minerals",
};

export const REGION_INTRO: Record<MapRegionId, string> = {
  brain: "Your brain controls thought, memory, and mood.",
  heart: "Your heart pumps blood through your entire body.",
  stomach: "Your gut breaks down food and absorbs nutrients.",
  blood: "Your blood carries oxygen, sugar, and nutrients everywhere.",
  thyroid: "Your thyroid sets your energy and metabolism pace.",
  liver: "Your liver cleans your blood and processes what you eat.",
  kidneys: "Your kidneys filter waste from your blood.",
  bones: "Your bones stay strong with the right minerals and vitamins.",
};

export interface OrganStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  visual: OrganVisualSeverity;
}

const GLOW_STYLES: Record<OrganVisualSeverity, OrganStyle> = {
  hh: { fill: "#C4617A", fillOpacity: 0.5, stroke: "#C4617A", visual: "hh" },
  ll: { fill: "#C4617A", fillOpacity: 0.5, stroke: "#C4617A", visual: "ll" },
  h_or_l: {
    fill: "#D4956A",
    fillOpacity: 0.45,
    stroke: "#D4956A",
    visual: "h_or_l",
  },
  normal: {
    fill: "#4ECBA8",
    fillOpacity: 0.35,
    stroke: "#4ECBA8",
    visual: "normal",
  },
  absent: {
    fill: "#252830",
    fillOpacity: 0.6,
    stroke: "#3E4260",
    visual: "absent",
  },
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function markerMatchesValue(marker: string, value: LabValue): boolean {
  const m = normalize(marker);
  const medical = normalize(matchName(value));
  const plain = normalize(getValueLabel(value));
  if (!m) return false;
  return (
    medical.includes(m) ||
    m.includes(medical) ||
    plain.includes(m) ||
    m.includes(plain)
  );
}

export function getValuesForSystem(
  systemId: BodySystemId,
  values: LabValue[]
): LabValue[] {
  const markers = SYSTEM_MAPPING[systemId];
  return values.filter((val) =>
    markers.some((marker) => markerMatchesValue(marker, val))
  );
}

function isRiskFlagged(
  value: LabValue,
  flaggedValues: { name: string }[]
): boolean {
  const v = matchName(value).toLowerCase();
  const plain = getValueLabel(value).toLowerCase();
  return flaggedValues.some((f) => {
    const fn = f.name.toLowerCase();
    return (
      v.includes(fn) ||
      fn.includes(v) ||
      plain.includes(fn) ||
      fn.includes(plain) ||
      markerMatchesValue(f.name, value)
    );
  });
}

function valueVisualFlag(
  value: LabValue,
  flaggedValues: { name: string }[]
): OrganVisualSeverity | null {
  const risk = isRiskFlagged(value, flaggedValues);
  const text = `${matchName(value)} ${value.result}`.toUpperCase();
  if (text.includes("HH") || (risk && value.status === "high")) return "hh";
  if (text.includes("LL") || (risk && value.status === "low")) return "ll";
  if (value.status === "high" || value.status === "low") return "h_or_l";
  if (value.status === "normal") return "normal";
  return null;
}

function systemVisualSeverity(
  systemValues: LabValue[],
  flaggedValues: { name: string }[]
): OrganVisualSeverity {
  if (systemValues.length === 0) return "absent";

  const flags = systemValues
    .map((v) => valueVisualFlag(v, flaggedValues))
    .filter(Boolean) as OrganVisualSeverity[];

  if (flags.includes("hh")) return "hh";
  if (flags.includes("ll")) return "ll";
  if (flags.includes("h_or_l")) return "h_or_l";
  return "normal";
}

export interface BodySystemState {
  id: BodySystemId;
  label: string;
  severity: SystemSeverity;
  visual: OrganVisualSeverity;
  values: LabValue[];
  affected: boolean;
}

export function computeBodySystems(
  values: LabValue[],
  flaggedValues: { name: string; reason: string }[] = []
): BodySystemState[] {
  const systemIds = Object.keys(SYSTEM_MAPPING) as BodySystemId[];

  return systemIds.map((id) => {
    const systemValues = getValuesForSystem(id, values);
    const visual = systemVisualSeverity(systemValues, flaggedValues);

    let severity: SystemSeverity = "none";
    if (visual === "hh" || visual === "ll") severity = "critical";
    else if (visual === "h_or_l") severity = "warning";
    else if (visual === "normal") severity = "normal";

    const affected =
      visual === "hh" || visual === "ll" || visual === "h_or_l";

    return {
      id,
      label: REGION_LABELS[findRegionForSystem(id)] ?? id,
      severity,
      visual,
      values: systemValues,
      affected,
    };
  });
}

export function getRegionStyle(visual: OrganVisualSeverity): OrganStyle {
  return GLOW_STYLES[visual];
}

export function computeRegionStyles(
  systems: BodySystemState[]
): Record<MapRegionId, OrganStyle> {
  const bySystem = new Map(systems.map((s) => [s.id, s]));
  const regions = Object.keys(REGION_TO_SYSTEM) as MapRegionId[];
  const result = {} as Record<MapRegionId, OrganStyle>;

  for (const region of regions) {
    const systemId = REGION_TO_SYSTEM[region];
    const system = bySystem.get(systemId);
    const visual = system?.visual ?? "absent";
    result[region] = getRegionStyle(visual);
  }

  return result;
}

export function findMostCriticalSystem(
  systems: BodySystemState[]
): BodySystemId | null {
  const order: OrganVisualSeverity[] = [
    "hh",
    "ll",
    "h_or_l",
    "normal",
    "absent",
  ];
  for (const level of order) {
    const match = systems.find(
      (s) => s.visual === level && s.values.length > 0
    );
    if (match) return match.id;
  }
  return systems.find((s) => s.values.length > 0)?.id ?? null;
}

export function findRegionForSystem(systemId: BodySystemId): MapRegionId {
  const priority: Partial<Record<BodySystemId, MapRegionId>> = {
    brain: "brain",
    thyroid: "thyroid",
    heart: "heart",
    liver: "liver",
    kidneys: "kidneys",
    blood: "blood",
    bones: "bones",
  };
  return priority[systemId] ?? "heart";
}

export function getSimpleStatus(visual: OrganVisualSeverity): {
  label: string;
  color: string;
} {
  switch (visual) {
    case "hh":
    case "ll":
      return { label: "Critical", color: "#C4617A" };
    case "h_or_l":
      return { label: "Needs attention", color: "#D4956A" };
    case "normal":
      return { label: "Healthy", color: "#4ECBA8" };
    default:
      return { label: "Not tested", color: "#3E4260" };
  }
}

export function getSeverityBadge(visual: OrganVisualSeverity): {
  label: string;
  className: string;
} {
  switch (visual) {
    case "hh":
    case "ll":
      return { label: "Critical", className: "badge-critical" };
    case "h_or_l":
      return { label: "Needs attention", className: "badge-warn" };
    case "normal":
      return { label: "All good", className: "badge-normal" };
    default:
      return {
        label: "Not tested",
        className:
          "rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-text-tertiary",
      };
  }
}

export function statusBadge(status: ValueStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "high":
      return { label: "High", className: "badge-critical" };
    case "low":
      return { label: "Low", className: "badge-warn" };
    default:
      return { label: "Healthy", className: "badge-normal" };
  }
}

export function getFlaggedValues(
  system: BodySystemState,
  flaggedValues: { name: string }[]
): LabValue[] {
  return system.values.filter(
    (v) => v.status !== "normal" || isRiskFlagged(v, flaggedValues)
  );
}

export function getMostCriticalFlaggedValue(
  system: BodySystemState,
  flaggedValues: { name: string }[]
): LabValue | null {
  const flagged = getFlaggedValues(system, flaggedValues);
  if (!flagged.length) return null;

  const rank = (v: LabValue) => {
    if (system.visual === "hh" || system.visual === "ll") {
      if (v.status === "high" || v.status === "low") return 0;
    }
    if (v.status === "high") return 1;
    if (v.status === "low") return 2;
    return 3;
  };

  return [...flagged].sort((a, b) => rank(a) - rank(b))[0];
}

export function getPersonalClosing(
  system: BodySystemState,
  flaggedValues: { name: string }[]
): string {
  const flagged = getFlaggedValues(system, flaggedValues);
  const hasData = system.values.length > 0;

  if (!hasData) {
    return "We did not find tests for this area in your report.";
  }

  if (flagged.length === 0) {
    return "Your numbers here look steady — nothing urgent stands out.";
  }

  if (system.visual === "hh" || system.visual === "ll") {
    return "These numbers suggest this area needs care soon. Worth discussing with your doctor.";
  }

  if (system.visual === "h_or_l") {
    return "A few results are off — a follow-up chat with your doctor would be wise.";
  }

  return "Your numbers here look steady — nothing urgent stands out.";
}

export interface BodyMapAnnotation {
  region: MapRegionId;
  organX: number;
  organY: number;
  labelX: number;
  labelY: number;
  side: "left" | "right";
  title: string;
  statusLabel: string;
  statusColor: string;
}

const ANNOTATION_LAYOUT: Record<
  MapRegionId,
  {
    organX: number;
    organY: number;
    labelX: number;
    labelY: number;
    side: "left" | "right";
  }
> = {
  brain: { organX: 220, organY: 50, labelX: 20, labelY: 52, side: "left" },
  heart: { organX: 198, organY: 150, labelX: 20, labelY: 150, side: "left" },
  stomach: {
    organX: 208,
    organY: 220,
    labelX: 20,
    labelY: 220,
    side: "left",
  },
  blood: { organX: 220, organY: 290, labelX: 20, labelY: 290, side: "left" },
  thyroid: {
    organX: 220,
    organY: 98,
    labelX: 360,
    labelY: 98,
    side: "right",
  },
  liver: { organX: 252, organY: 170, labelX: 360, labelY: 170, side: "right" },
  kidneys: {
    organX: 220,
    organY: 254,
    labelX: 360,
    labelY: 254,
    side: "right",
  },
  bones: { organX: 220, organY: 400, labelX: 360, labelY: 400, side: "right" },
};

/** Keep stacked labels from overlapping on the same side. */
function spreadAnnotationLabels(
  layouts: typeof ANNOTATION_LAYOUT
): Record<MapRegionId, { labelY: number }> {
  const MIN_GAP = 38;
  const result = {} as Record<MapRegionId, { labelY: number }>;
  const sides: ("left" | "right")[] = ["left", "right"];

  for (const side of sides) {
    const entries = (Object.keys(layouts) as MapRegionId[])
      .filter((r) => layouts[r].side === side)
      .map((r) => ({ region: r, labelY: layouts[r].labelY }))
      .sort((a, b) => a.labelY - b.labelY);

    let prevY = -Infinity;
    for (const { region, labelY } of entries) {
      const y = labelY - prevY < MIN_GAP ? prevY + MIN_GAP : labelY;
      result[region] = { labelY: y };
      prevY = y;
    }
  }

  return result;
}

/** Front-view figure on the illustration panel — labels sit in margins outside these edges. */
export const BODY_FIGURE = {
  panelX: 86,
  panelY: 10,
  panelW: 268,
  panelH: 540,
  x: 92,
  y: 14,
  width: 256,
  height: 532,
  /** Left/right edges of the body panel for routing annotation lines. */
  edgeLeft: 86,
  edgeRight: 354,
  labelMarginLeft: 20,
  labelMarginRight: 360,
};

const LEFT_REGIONS: MapRegionId[] = ["brain", "heart", "stomach", "blood"];
const RIGHT_REGIONS: MapRegionId[] = [
  "thyroid",
  "liver",
  "kidneys",
  "bones",
];

export function buildBodyMapAnnotations(
  systems: BodySystemState[]
): BodyMapAnnotation[] {
  const bySystem = new Map(systems.map((s) => [s.id, s]));
  const regions = [...LEFT_REGIONS, ...RIGHT_REGIONS];
  const spread = spreadAnnotationLabels(ANNOTATION_LAYOUT);

  return regions.map((region) => {
    const layout = ANNOTATION_LAYOUT[region];
    const system = bySystem.get(REGION_TO_SYSTEM[region]);
    const visual = system?.visual ?? "absent";
    const status = getSimpleStatus(visual);

    return {
      region,
      organX: layout.organX,
      organY: layout.organY,
      labelX: layout.labelX,
      labelY: spread[region]?.labelY ?? layout.labelY,
      side: layout.side,
      title: REGION_LABELS[region],
      statusLabel: status.label,
      statusColor: status.color,
    };
  });
}
