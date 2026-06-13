"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProficiencySelector } from "@/components/skills/proficiency-selector";
import { GraduationCap, Plus, ArrowRight, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LearningPath {
  id: string;
  title: string;
  status: string;
  estimatedWeeks: number | null;
  targetSkill?: { name: string } | null;
  createdAt: string;
}

interface Skill { id: string; name: string; category: string; }

export default function LearningPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [skillResults, setSkillResults] = useState<Skill[]>([]);
  const [form, setForm] = useState({ skillId: "", skillName: "", targetProficiency: "ADVANCED", context: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/ai/learning-path")
      .then((r) => r.json())
      .then((data) => { setPaths(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!skillQuery) { setSkillResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/skills?q=${encodeURIComponent(skillQuery)}`)
        .then((r) => r.json())
        .then((d) => setSkillResults(d.slice(0, 6)));
    }, 300);
    return () => clearTimeout(t);
  }, [skillQuery]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.skillId) { toast.error("Select a target skill"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSkillId: form.skillId,
          targetProficiency: form.targetProficiency,
          context: form.context || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start generation");
      toast.info("Generating learning path…");
      setCreating(false);
      router.push(`/learning/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  const STATUS_COLOR: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <PageHeader title="Learning Paths" description="AI-generated paths to close your skill gaps.">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate path
        </Button>
      </PageHeader>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Learning Path</DialogTitle>
            <DialogDescription className="sr-only">Choose a target skill and proficiency to generate an AI-powered learning path.</DialogDescription>
          </DialogHeader>
          <form onSubmit={generate} className="space-y-4">
            <div className="space-y-2">
              <Label>Target skill</Label>
              <Input
                placeholder="Search skill to learn…"
                value={form.skillName || skillQuery}
                onChange={(e) => { setSkillQuery(e.target.value); setForm((f) => ({ ...f, skillId: "", skillName: "" })); }}
              />
              {skillResults.length > 0 && !form.skillId && (
                <div className="border rounded bg-card shadow-sm max-h-36 overflow-y-auto">
                  {skillResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex justify-between"
                      onClick={() => { setForm((f) => ({ ...f, skillId: s.id, skillName: s.name })); setSkillResults([]); setSkillQuery(""); }}
                    >
                      <span>{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Target proficiency</Label>
              <ProficiencySelector
                value={form.targetProficiency}
                onChange={(v) => setForm((f) => ({ ...f, targetProficiency: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Context (optional)</Label>
              <Input
                placeholder="e.g. building REST APIs with Node.js"
                value={form.context}
                onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || !form.skillId}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : "Generate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : paths.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No learning paths yet"
          description="Generate an AI-powered learning path to master any skill."
        >
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate your first path
          </Button>
        </EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path) => (
            <Card key={path.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-snug">{path.title || "Generating…"}</CardTitle>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[path.status] ?? ""}`}>
                    {path.status === "PROCESSING" && <Loader2 className="inline h-3 w-3 mr-1 animate-spin" />}
                    {path.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {path.estimatedWeeks && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{path.estimatedWeeks} week{path.estimatedWeeks !== 1 ? "s" : ""}
                  </p>
                )}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/learning/${path.id}`}>
                    View path <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
