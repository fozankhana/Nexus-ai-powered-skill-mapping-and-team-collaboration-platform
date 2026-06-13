"use client";

import { useEffect, useState } from "react";
import { TeamSkillHeatmap } from "./team-skill-heatmap";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamSkillHeatmapWrapperProps {
  teamId: string;
}

export function TeamSkillHeatmapWrapper({ teamId }: TeamSkillHeatmapWrapperProps) {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/skill-map`)
      .then((r) => r.json())
      .then((d) => { setData(d.heatmap ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [teamId]);

  if (loading) return <Skeleton className="h-64 w-full" />;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <TeamSkillHeatmap data={(data ?? []) as any} />;
}
