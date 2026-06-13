"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Loader2,
  CheckCircle2,
  Clock,
  BookOpen,
  XCircle,
} from "lucide-react";

interface PathStep {
  order: number;
  title: string;
  type: string;
  estimatedHours: number;
  resourceTitle?: string;
  milestoneOutcome: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  status: string;
  estimatedWeeks: number | null;
  steps: PathStep[] | null;
  targetSkill?: { name: string } | null;
}

const TYPE_ICON: Record<string, string> = {
  video: "🎬",
  article: "📄",
  course: "🎓",
  project: "🔨",
  practice: "💪",
  book: "📚",
};

export default function LearningPathPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = use(params);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [polling, setPolling] = useState(false);

  const fetchPath = useCallback(async () => {
    const res = await fetch(`/api/ai/learning-path/${pathId}`);
    const data = await res.json();
    setPath(data);
    return data;
  }, [pathId]);

  useEffect(() => {
    fetchPath().then((data) => {
      if (data?.status === "PROCESSING") {
        setPolling(true);
        const interval = setInterval(async () => {
          const updated = await fetchPath();
          if (updated?.status !== "PROCESSING") {
            clearInterval(interval);
            setPolling(false);
          }
        }, 2500);
        return () => clearInterval(interval);
      }
    });
  }, [fetchPath]);

  if (!path) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const steps = (path.steps as PathStep[] | null) ?? [];
  const totalHours = steps.reduce((sum, s) => sum + (s.estimatedHours ?? 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={path.title || "Learning Path"}
        description={path.targetSkill ? `Target: ${path.targetSkill.name}` : undefined}
      />

      <div className="flex flex-wrap gap-3">
        {path.status === "PROCESSING" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating…
          </Badge>
        )}
        {path.status === "COMPLETED" && (
          <Badge variant="secondary" className="flex items-center gap-1 text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </Badge>
        )}
        {path.status === "FAILED" && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )}
        {path.estimatedWeeks && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ~{path.estimatedWeeks} weeks
          </Badge>
        )}
        {totalHours > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {totalHours}h total
          </Badge>
        )}
      </div>

      {path.status === "PROCESSING" && (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <p className="font-medium">Claude is crafting your learning path…</p>
            <p className="text-sm text-muted-foreground">Usually takes 15–30 seconds.</p>
          </CardContent>
        </Card>
      )}

      {path.status === "FAILED" && (
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center space-y-2">
            <XCircle className="h-8 w-8 mx-auto text-destructive" />
            <p className="font-medium">Generation failed</p>
            <p className="text-sm text-muted-foreground">Please try again from the learning paths page.</p>
          </CardContent>
        </Card>
      )}

      {path.description && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{path.description}</p>
          </CardContent>
        </Card>
      )}

      {steps.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Learning Steps</h2>
          {steps.map((step, i) => (
            <Card key={i} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 mt-0.5">
                    {step.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{step.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_ICON[step.type?.toLowerCase()] ?? "📌"} {step.type}
                      </Badge>
                      {step.estimatedHours && (
                        <span className="text-xs text-muted-foreground">{step.estimatedHours}h</span>
                      )}
                    </div>
                    {step.resourceTitle && (
                      <p className="text-xs text-muted-foreground mt-1">Resource: {step.resourceTitle}</p>
                    )}
                    {step.milestoneOutcome && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Outcome: {step.milestoneOutcome}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
