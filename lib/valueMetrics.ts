import type { LabValue, ValueStatus } from "@/lib/types";

export const STATUS_COLORS: Record<ValueStatus, string> = {
  normal: "#1D9E75",
  low: "#EF9F27",
  high: "#E24B4A",
};

export function parseNumericResult(result: string): number | null {
  const num = parseFloat(result.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? null : num;
}

export function parseReferenceRange(
  referenceRange: string
): { min: number; max: number } | null {
  const nums = referenceRange.match(/[\d.]+/g);
  if (!nums || nums.length < 2) return null;
  const min = parseFloat(nums[0]);
  const max = parseFloat(nums[1]);
  if (isNaN(min) || isNaN(max)) return null;
  return { min, max };
}

/** Position on chart X axis: 0% = range min, 100% = range max (can exceed). */
export function getChartPosition(value: LabValue): number {
  const num = parseNumericResult(value.result);
  const range = parseReferenceRange(value.referenceRange);
  if (num === null || !range) return 50;
  const span = range.max - range.min || 1;
  return ((num - range.min) / span) * 100;
}

export function getStatusNote(status: ValueStatus): string {
  switch (status) {
    case "normal":
      return "Within normal range";
    case "low":
      return "Slightly below normal range";
    case "high":
      return "Above normal range";
  }
}

export function formatValueLabel(value: LabValue): string {
  const unit = value.unit ? ` ${value.unit}` : "";
  return `${value.result}${unit}`;
}

export type ChartRow = LabValue & {
  position: number;
  fill: string;
  note: string;
  valueLabel: string;
};

export function toChartRows(values: LabValue[]): ChartRow[] {
  return values.map((v) => ({
    ...v,
    position: getChartPosition(v),
    fill: STATUS_COLORS[v.status],
    note: getStatusNote(v.status),
    valueLabel: formatValueLabel(v),
  }));
}

export function getChartDomain(rows: ChartRow[]): [number, number] {
  if (!rows.length) return [-5, 105];
  const positions = rows.map((r) => r.position);
  const min = Math.min(...positions, 0);
  const max = Math.max(...positions, 100);
  const pad = 8;
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

