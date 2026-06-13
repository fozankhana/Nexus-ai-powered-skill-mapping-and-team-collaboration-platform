"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HeatmapData {
  category: string;
  BEGINNER: number;
  INTERMEDIATE: number;
  ADVANCED: number;
  EXPERT: number;
}

interface TeamSkillHeatmapProps {
  data: HeatmapData[];
}

const COLORS = {
  BEGINNER: "hsl(210, 80%, 60%)",
  INTERMEDIATE: "hsl(150, 60%, 50%)",
  ADVANCED: "hsl(40, 90%, 55%)",
  EXPERT: "hsl(270, 70%, 60%)",
};

export function TeamSkillHeatmap({ data }: TeamSkillHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No skill data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        {(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const).map((p) => (
          <Bar key={p} dataKey={p} stackId="a" fill={COLORS[p]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
