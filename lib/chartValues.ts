import { getValueLabel, toPlainEnglishName } from "@/lib/labValueNames";
import type { LabValue } from "@/lib/types";

const CHART_PRIORITY: { plain: string; markers: string[] }[] = [
  { plain: "3-month sugar average", markers: ["hba1c"] },
  { plain: "Bad cholesterol", markers: ["ldl"] },
  { plain: "Kidney filtering speed", markers: ["egfr"] },
  { plain: "Oxygen in your blood", markers: ["hemoglobin"] },
  { plain: "Body inflammation", markers: ["hscrp", "crp"] },
  { plain: "Good cholesterol", markers: ["hdl"] },
  { plain: "Iron reserve", markers: ["ferritin"] },
];

const CHART_ROW_COUNT = 7;

function valueKey(value: LabValue): string {
  return (value.medicalName ?? value.name).toLowerCase();
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesMarkers(value: LabValue, markers: string[]): boolean {
  const medical = normalize(value.medicalName ?? value.name);
  const plain = normalize(getValueLabel(value));

  return markers.some((m) => {
    const mk = normalize(m);

    if (mk === "ldl") {
      return (
        plain === normalize("Bad cholesterol") ||
        medical.includes("ldlcholesterol") ||
        (medical.includes("ldl") &&
          !medical.includes("total") &&
          !medical.includes("vldl") &&
          !medical.includes("nonhdl"))
      );
    }

    if (mk === "hdl") {
      return (
        plain === normalize("Good cholesterol") ||
        medical.includes("hdlcholesterol") ||
        (medical.includes("hdl") && !medical.includes("nonhdl") && !medical.includes("ldl"))
      );
    }

    if (mk === "crp" || mk === "hscrp") {
      return medical.includes("hscrp") || medical.includes("crp");
    }

    return (
      medical.includes(mk) ||
      mk.includes(medical) ||
      plain.includes(mk) ||
      mk.includes(plain)
    );
  });
}

function matchesPlainTarget(value: LabValue, plain: string): boolean {
  return getValueLabel(value) === plain || toPlainEnglishName(value.medicalName ?? value.name) === plain;
}

function isFlagged(
  value: LabValue,
  flaggedValues: { name: string }[]
): boolean {
  if (value.status !== "normal") return true;
  const medical = normalize(value.medicalName ?? value.name);
  const plain = normalize(getValueLabel(value));
  return flaggedValues.some((f) => {
    const fn = normalize(f.name);
    return (
      medical.includes(fn) ||
      fn.includes(medical) ||
      plain.includes(fn) ||
      fn.includes(plain)
    );
  });
}

function importanceScore(
  value: LabValue,
  flaggedValues: { name: string }[]
): number {
  let score = 0;
  if (value.status === "high" || value.status === "low") score += 10;
  if (isFlagged(value, flaggedValues)) score += 5;
  return score;
}

/**
 * Picks exactly 7 chart rows: priority tests first (flagged preferred),
 * then other flagged values, then remaining normals.
 */
export function selectTopChartValues(
  values: LabValue[],
  flaggedValues: { name: string }[] = []
): LabValue[] {
  if (!values.length) return [];

  const used = new Set<string>();
  const result: LabValue[] = [];

  const pickBest = (candidates: LabValue[]): LabValue | undefined => {
    const available = candidates.filter((v) => !used.has(valueKey(v)));
    if (!available.length) return undefined;
    available.sort(
      (a, b) =>
        importanceScore(b, flaggedValues) - importanceScore(a, flaggedValues)
    );
    return available[0];
  };

  for (const { plain, markers } of CHART_PRIORITY) {
    if (result.length >= CHART_ROW_COUNT) break;

    const candidates = values.filter(
      (v) =>
        (matchesPlainTarget(v, plain) || matchesMarkers(v, markers)) &&
        !used.has(valueKey(v))
    );
    const picked = pickBest(candidates);
    if (picked) {
      result.push(picked);
      used.add(valueKey(picked));
    }
  }

  const remaining = values.filter((v) => !used.has(valueKey(v)));
  const flaggedPool = remaining.filter((v) => isFlagged(v, flaggedValues));
  const normalPool = remaining.filter((v) => !isFlagged(v, flaggedValues));

  flaggedPool.sort(
    (a, b) =>
      importanceScore(b, flaggedValues) - importanceScore(a, flaggedValues)
  );

  for (const v of [...flaggedPool, ...normalPool]) {
    if (result.length >= CHART_ROW_COUNT) break;
    result.push(v);
    used.add(valueKey(v));
  }

  return result.slice(0, CHART_ROW_COUNT);
}
