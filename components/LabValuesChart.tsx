"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LabValue } from "@/lib/types";
import {
  CHART_AXIS_LABELS,
  getChartDomain,
  toChartRows,
  type ChartRow,
} from "@/lib/valueMetrics";

const ROW_HEIGHT = 52;
const BAR_SIZE = 20;
const Y_AXIS_WIDTH = 180;

interface LabValuesChartProps {
  values: LabValue[];
}

function wrapLabel(name: string): string[] {
  const max = 24;
  if (name.length <= max) return [name];
  const breakAt = name.lastIndexOf(" ", max);
  if (breakAt > 8) {
    return [name.slice(0, breakAt), name.slice(breakAt + 1)];
  }
  return [name.slice(0, max), name.slice(max).trim()];
}

function YAxisTick(props: {
  x?: string | number;
  y?: string | number;
  payload?: { value: string };
}) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const lines = wrapLabel(String(props.payload?.value ?? ""));
  const lineHeight = 12 * 1.4;

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={-10}
          y={0}
          dy={
            lines.length === 1
              ? 4
              : i === 0
                ? -(lineHeight / 2) + 4
                : lineHeight / 2 + 4
          }
          textAnchor="end"
          fill="#9896A8"
          fontSize={12}
          style={{ lineHeight: 1.4 }}
        >
          {line}
        </text>
      ))}
    </g>
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
    <div className="max-w-xs rounded-element border border-border bg-overlay px-4 py-3 shadow-lg">
      <p className="text-[13px] font-normal text-text-primary">
        {row.plainName} —{" "}
        <span className="value-mono">{row.valueLabel}</span>
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
        {row.warmDetail}
      </p>
      <p className="mt-2 text-[13px] font-medium text-text-primary">
        {row.statusLine}
      </p>
    </div>
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
    <div className="flex-1 rounded-element border border-border bg-input p-5 text-center">
      <p className={`metric-value ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

export function LabValuesChart({ values }: LabValuesChartProps) {
  const chartData = useMemo(() => toChartRows(values), [values]);
  const domain = getChartDomain();
  const chartHeight = Math.max(chartData.length * ROW_HEIGHT, ROW_HEIGHT);

  const total = values.length;
  const normalCount = values.filter((v) => v.status === "normal").length;
  const attentionCount = total - normalCount;

  if (!chartData.length) return null;

  return (
    <div className="w-full">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Key results shown" value={total} />
        <MetricCard label="In normal range" value={normalCount} accent="green" />
        <MetricCard
          label="Need attention"
          value={attentionCount}
          accent={attentionCount > 0 ? "warn" : undefined}
        />
      </div>

      <div
        className="lab-chart w-full p-6"
        style={{ minHeight: chartHeight + 48 }}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 28 }}
            barCategoryGap={12}
            barGap={0}
          >
            <ReferenceArea
              x1={0}
              x2={20}
              fill="#4D9FFF"
              fillOpacity={0.1}
              ifOverflow="extendDomain"
            />
            <ReferenceArea
              x1={20}
              x2={80}
              fill="#00D4AA"
              fillOpacity={0.08}
              ifOverflow="extendDomain"
            />
            <ReferenceArea
              x1={80}
              x2={100}
              fill="#FF4D6A"
              fillOpacity={0.1}
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              x={20}
              stroke="#4D9FFF"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              x={80}
              stroke="#FF4D6A"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <XAxis
              type="number"
              domain={domain}
              ticks={[0, 50, 100]}
              tick={{ fill: "#9896A8", fontSize: 11 }}
              axisLine={{ stroke: "#1E1E2E" }}
              tickLine={false}
              tickFormatter={(v) => CHART_AXIS_LABELS[v as number] ?? ""}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={Y_AXIS_WIDTH}
              axisLine={false}
              tickLine={false}
              tick={YAxisTick}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              wrapperStyle={{ zIndex: 20 }}
            />
            <Bar
              dataKey="position"
              barSize={BAR_SIZE}
              radius={[0, 4, 4, 0]}
              animationDuration={800}
              animationEasing="ease-out"
              isAnimationActive
            >
              {chartData.map((row) => (
                <Cell key={row.medicalName} fill={row.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
