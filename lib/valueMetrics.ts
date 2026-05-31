import type { LabValue, ValueStatus } from "@/lib/types";
import {
  getValueLabel,
  getWarmDetailMessage,
  getWarmStatusLine,
} from "@/lib/labValueNames";

export const STATUS_COLORS: Record<ValueStatus, string> = {
  normal: "#00D4AA",
  low: "#4D9FFF",
  high: "#FF4D6A",
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

/** Position on chart X axis: 0 = range min, 100 = range max. */
export function getChartPosition(value: LabValue): number {
  const num = parseNumericResult(value.result);
  const range = parseReferenceRange(value.referenceRange);
  if (num === null || !range) return 50;
  const span = range.max - range.min || 1;
  return ((num - range.min) / span) * 100;
}

export function formatValueLabel(value: LabValue): string {
  const unit = value.unit ? ` ${value.unit}` : "";
  return `${value.result}${unit}`;
}

export type ChartRow = LabValue & {
  medicalName: string;
  plainName: string;
  position: number;
  fill: string;
  warmDetail: string;
  statusLine: string;
  valueLabel: string;
};

export function toChartRows(values: LabValue[]): ChartRow[] {
  return values.map((v) => {
    const plainName = getValueLabel(v);
    return {
      ...v,
      medicalName: v.medicalName ?? v.name,
      name: plainName,
      plainName,
      position: getChartPosition(v),
      fill: STATUS_COLORS[v.status],
      warmDetail: getWarmDetailMessage(plainName, v.status),
      statusLine: getWarmStatusLine(v.status),
      valueLabel: formatValueLabel(v),
    };
  });
}

/** Fixed scale: 0 = too low, 50 = normal zone center, 100 = too high. */
export function getChartDomain(): [number, number] {
  return [0, 100];
}

export const CHART_AXIS_LABELS: Record<number, string> = {
  0: "Too Low",
  50: "Normal Zone",
  100: "Too High",
};
