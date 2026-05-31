"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LabValue, ValueStatus } from "@/lib/types";
import {
  getChartDomain,
  toChartRows,
  type ChartRow,
} from "@/lib/valueMetrics";

interface LabValuesChartProps {
  values: LabValue[];
}

function StatusBadge({ status }: { status: ValueStatus }) {
  const styles = {
    normal: "bg-accent/20 text-accent",
    low: "bg-warning/20 text-warning",
    high: "bg-danger/20 text-danger",
  };
  const labels = { normal: "Normal", low: "Low", high: "High" };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-element border border-border bg-[#1a1a1a] px-4 py-3 shadow-lg">
      <p className="mb-2 font-medium text-text-primary">{row.name}</p>
      <p className="text-sm text-text-secondary">
        Your value:{" "}
        <span className="text-text-primary">{row.valueLabel}</span>
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        Normal range: {row.referenceRange || "—"}
      </p>
      <div className="mt-2">
        <StatusBadge status={row.status} />
      </div>
      <p className="mt-2 text-xs text-text-secondary">{row.note}</p>
    </div>
  );
}

function ValueEndLabel(
  props: {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    index?: number;
    chartData: ChartRow[];
  }
) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const index = props.index ?? 0;
  const { chartData } = props;
  const row = chartData[index];
  if (!row) return null;
  return (
    <text
      x={x + width + 10}
      y={y + height / 2}
      fill="#f5f5f5"
      fontSize={12}
      dominantBaseline="middle"
    >
      {row.valueLabel}
    </text>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "warn";
}) {
  const valueClass =
    accent === "green"
      ? "text-accent"
      : accent === "warn"
        ? "text-warning"
        : "text-text-primary";
  return (
    <div className="flex-1 rounded-element border border-border bg-background/60 px-4 py-3 text-center">
      <p className={`text-2xl font-semibold tabular-nums ${valueClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

export function LabValuesChart({ values }: LabValuesChartProps) {
  const chartData = useMemo(() => toChartRows(values), [values]);
  const domain = useMemo(() => getChartDomain(chartData), [chartData]);
  const chartHeight = Math.max(chartData.length * 40, 160);

  const total = values.length;
  const normalCount = values.filter((v) => v.status === "normal").length;
  const attentionCount = total - normalCount;

  if (!chartData.length) return null;

  return (
    <div className="w-full">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Total values checked" value={total} />
        <MetricCard label="In normal range" value={normalCount} accent="green" />
        <MetricCard
          label="Need attention"
          value={attentionCount}
          accent={attentionCount > 0 ? "warn" : undefined}
        />
      </div>

      <div
        className="w-full rounded-element bg-[#111111] p-6"
        style={{ minHeight: chartHeight + 48 }}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 100, left: 8, bottom: 8 }}
            barCategoryGap="28%"
          >
            <ReferenceArea
              x1={0}
              x2={100}
              fill="#1D9E75"
              fillOpacity={0.08}
              ifOverflow="extendDomain"
            />
            <ReferenceArea
              x1={20}
              x2={80}
              fill="#1D9E75"
              fillOpacity={0.05}
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              x={0}
              stroke="#1D9E75"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              x={100}
              stroke="#1D9E75"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <XAxis
              type="number"
              domain={domain}
              tick={{ fill: "#888888", fontSize: 11 }}
              axisLine={{ stroke: "#1f1f1f" }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "#888888", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="position"
              radius={[0, 4, 4, 0]}
              animationDuration={800}
              animationEasing="ease-out"
              isAnimationActive
            >
              {chartData.map((row) => (
                <Cell key={row.name} fill={row.fill} />
              ))}
              <LabelList
                content={(props) => (
                  <ValueEndLabel {...props} chartData={chartData} />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
