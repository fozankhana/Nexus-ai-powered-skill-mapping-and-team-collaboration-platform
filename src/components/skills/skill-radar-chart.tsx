"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { proficiencyToNumber } from "@/lib/utils";

interface SkillPoint {
  category: string;
  avgLevel: number;
  count: number;
}

interface SkillRadarChartProps {
  userSkills: Array<{
    proficiency: string;
    skill: { category: string };
  }>;
}

function buildRadarData(userSkills: SkillRadarChartProps["userSkills"]): SkillPoint[] {
  const byCategory: Record<string, number[]> = {};
  for (const us of userSkills) {
    const cat = us.skill.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(proficiencyToNumber(us.proficiency as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"));
  }
  return Object.entries(byCategory).map(([category, levels]) => ({
    category,
    avgLevel: levels.reduce((a, b) => a + b, 0) / levels.length,
    count: levels.length,
  }));
}

export function SkillRadarChart({ userSkills }: SkillRadarChartProps) {
  const data = buildRadarData(userSkills);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Add skills to see your radar chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid className="stroke-border" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
        <Radar
          name="Skill Level"
          dataKey="avgLevel"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value) => [Number(value).toFixed(1) + " / 4", "Avg. level"]}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
