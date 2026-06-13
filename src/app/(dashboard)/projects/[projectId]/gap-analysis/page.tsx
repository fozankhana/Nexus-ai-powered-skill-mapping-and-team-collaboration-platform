"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Brain, RefreshCw, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface GapEntry {
  skillName: string;
  category: string;
  required: { proficiency: string; headcount: number; priority: string };
  available: { count: number; highestProficiency: string | null };
  delta: string;
  severity: string;
}

interface GapRecommendation {
  type: string;
  description: string;
  affectedSkills: string[];
  priority: string;
}

interface GapAnalysis {
  id: string;
  status: string;
  gapScore: number | null;
  summary: string | null;
  gaps: GapEntry[] | null;
  recommendations: GapRecommendation[] | null;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "text-green-600 dark:text-green-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
};

export default function GapAnalysisPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [running, setRunning] = useState(false);
  const [polling, setPolling] = useState(false);

  const pollAnalysis = useCallback(async (id: string) => {
    setPolling(true);
    const interval = setInterval(async () => {
      const res = await fetch(`/api/ai/gap-analysis/${id}`);
      const data = await res.json();
      setAnalysis(data);
      if (data.status === "COMPLETED" || data.status === "FAILED") {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`/api/ai/gap-analysis?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setAnalysis(data);
          if (data.status === "PROCESSING") {
            pollAnalysis(data.id);
          }
        }
      });
  }, [projectId, pollAnalysis]);

  async function runAnalysis() {
    setRunning(true);
    try {
      const res = await fetch("/api/ai/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start analysis");
      setAnalysis(data);
      toast.info("Analysis started — this may take 10–30 seconds.");
      pollAnalysis(data.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setRunning(false);
    }
  }

  const gapScore = analysis?.gapScore ?? null;
  // 100 = critical gaps (bad/red), 0 = fully covered (good/green)
  const scoreColor = gapScore == null ? "" : gapScore <= 25 ? "text-green-600" : gapScore <= 60 ? "text-amber-600" : "text-red-600";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="AI Skill Gap Analysis" description="Claude analyzes your project requirements against team capabilities.">
        <Button onClick={runAnalysis} disabled={running || polling}>
          {running || polling ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" />Run analysis</>
          )}
        </Button>
      </PageHeader>

      {!analysis && !running && (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-semibold">No analysis run yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make sure you&apos;ve added skill requirements to the project, then run the analysis.
              </p>
            </div>
            <Button onClick={runAnalysis} disabled={running}>
              <Brain className="mr-2 h-4 w-4" />
              Run gap analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {analysis?.status === "PROCESSING" && (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <p className="font-medium">Claude is analyzing your team&apos;s skills…</p>
            <p className="text-sm text-muted-foreground">This usually takes 10–30 seconds.</p>
          </CardContent>
        </Card>
      )}

      {analysis?.status === "FAILED" && (
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center space-y-2">
            <XCircle className="h-8 w-8 mx-auto text-destructive" />
            <p className="font-medium">Analysis failed</p>
            <p className="text-sm text-muted-foreground">Check that your project has skill requirements and the team has members.</p>
          </CardContent>
        </Card>
      )}

      {analysis?.status === "COMPLETED" && (
        <>
          {/* Score card */}
          <Card>
            <CardContent className="p-6 flex items-center gap-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${scoreColor}`}>
                  {gapScore?.toFixed(0) ?? "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Gap Score / 100</p>
              </div>
              <div className="flex-1">
                <Progress value={gapScore ?? 0} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            </CardContent>
          </Card>

          {/* Gaps */}
          {analysis.gaps && analysis.gaps.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Identified Skill Gaps</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analysis.gaps.map((gap, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{gap.skillName}</p>
                        <Badge variant="outline" className="text-xs">{gap.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Needs {gap.required.headcount}× at{" "}
                        <span className="font-medium">{gap.required.proficiency}</span>
                        {" "}· {gap.available.count} available
                        {gap.available.highestProficiency && ` (best: ${gap.available.highestProficiency})`}
                      </p>
                      {gap.delta && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">{gap.delta}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <AlertTriangle className={`h-4 w-4 ${SEVERITY_COLOR[gap.severity?.toLowerCase()] ?? ""}`} />
                      <span className={`text-xs font-medium capitalize ${SEVERITY_COLOR[gap.severity?.toLowerCase()] ?? ""}`}>
                        {gap.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs shrink-0 capitalize mt-0.5">
                        {rec.type}
                      </Badge>
                      <div>
                        <p className="text-sm">{rec.description}</p>
                        {rec.affectedSkills?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Affects: {rec.affectedSkills.join(", ")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
