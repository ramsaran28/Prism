"use client";

import { useMemo, useState } from "react";
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
import { FlagExplainModal } from "./FlagExplainModal";

const ROW_HEIGHT = 52;
const BAR_SIZE = 20;
const Y_AXIS_WIDTH = 180;

interface LabValuesChartProps {
  values: LabValue[];
  allValues?: LabValue[];
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
  const lineHeight = 14 * 1.4;

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
          fill="#8E92A8"
          fontSize={14}
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
    <div className="chart-tooltip max-w-xs">
      <p className="text-[15px] font-normal text-text-primary">
        {row.plainName} —{" "}
        <span className="value-mono">{row.valueLabel}</span>
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
        {row.warmDetail}
      </p>
      <p className="mt-2 text-[15px] font-medium text-text-primary">
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
    <div className="metric-card flex-1">
      <p className={`metric-value ${valueClass}`}>{value}</p>
      <p
        className="mt-1"
        style={{
          fontSize: 14,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          color: "#8B8FA8",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function ZoneLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-4 text-[14px]">
      <span style={{ color: "#6B8FCC", fontWeight: 500 }}>Too Low</span>
      <span style={{ color: "#4ECBA8", fontWeight: 500 }}>Normal Zone</span>
      <span style={{ color: "#C4617A", fontWeight: 500 }}>Too High</span>
    </div>
  );
}

function relatedFlagged(current: LabValue, all: LabValue[]): LabValue[] {
  return all
    .filter(
      (v) =>
        v.status !== "normal" &&
        (v.medicalName ?? v.name) !== (current.medicalName ?? current.name)
    )
    .slice(0, 3);
}

export function LabValuesChart({ values, allValues = [] }: LabValuesChartProps) {
  const [modalValue, setModalValue] = useState<LabValue | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const chartData = useMemo(() => toChartRows(values), [values]);
  const domain = getChartDomain();
  const chartHeight = Math.max(chartData.length * ROW_HEIGHT, ROW_HEIGHT);
  const sourceValues = allValues.length ? allValues : values;

  const total = values.length;
  const normalCount = values.filter((v) => v.status === "normal").length;
  const attentionCount = total - normalCount;

  if (!chartData.length) return null;

  function openWhy(row: ChartRow) {
    setModalValue(row);
    setModalOpen(true);
  }

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

      <ZoneLegend />

      <div
        className="lab-chart relative w-full p-6"
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
              fill="#6B8FCC"
              fillOpacity={0.1}
              ifOverflow="extendDomain"
            />
            <ReferenceArea
              x1={20}
              x2={80}
              fill="#4ECBA8"
              fillOpacity={0.08}
              ifOverflow="extendDomain"
            />
            <ReferenceArea
              x1={80}
              x2={100}
              fill="#C4617A"
              fillOpacity={0.1}
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              x={20}
              stroke="#6B8FCC"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              x={80}
              stroke="#C4617A"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <XAxis
              type="number"
              domain={domain}
              ticks={[0, 50, 100]}
              tick={{ fill: "#8E92A8", fontSize: 14 }}
              axisLine={{ stroke: "#32364A" }}
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

        <div
          className="pointer-events-none absolute left-0 right-0"
          style={{
            top: 24,
            paddingLeft: Y_AXIS_WIDTH + 12,
            paddingRight: 24,
          }}
        >
          {chartData.map((row) => (
            <div
              key={row.medicalName}
              className="group flex items-center justify-end pointer-events-auto"
              style={{ height: ROW_HEIGHT }}
            >
              {row.status !== "normal" && (
                <button
                  type="button"
                  onClick={() => openWhy(row)}
                  className="opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100"
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontWeight: 500,
                    color: "#8B8FA8",
                    background: "#252830",
                    border: "0.5px solid #32364A",
                    borderRadius: 99,
                    padding: "3px 10px",
                    cursor: "pointer",
                  }}
                >
                  Why?
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <FlagExplainModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalValue(null);
        }}
        value={modalValue}
        relatedFlagged={
          modalValue ? relatedFlagged(modalValue, sourceValues) : []
        }
      />
    </div>
  );
}
