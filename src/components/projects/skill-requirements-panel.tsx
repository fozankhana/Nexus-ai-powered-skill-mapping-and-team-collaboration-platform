"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProficiencySelector } from "@/components/skills/proficiency-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { proficiencyLabel } from "@/lib/utils";
import { useEffect, useCallback } from "react";

interface Requirement {
  id: string;
  priority: string;
  minProficiency: string;
  headcount: number;
  skill: { id: string; name: string; category: string };
}

interface SkillRequirementsPanelProps {
  projectId: string;
  initialRequirements: Requirement[];
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function SkillRequirementsPanel({ projectId, initialRequirements }: SkillRequirementsPanelProps) {
  const [requirements, setRequirements] = useState<Requirement[]>(initialRequirements);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [skillResults, setSkillResults] = useState<{ id: string; name: string; category: string }[]>([]);
  const [form, setForm] = useState({
    skillId: "",
    skillName: "",
    minProficiency: "INTERMEDIATE",
    headcount: "1",
    priority: "MEDIUM",
  });
  const [submitting, setSubmitting] = useState(false);

  const searchSkills = useCallback(async (q: string) => {
    if (!q) { setSkillResults([]); return; }
    const res = await fetch(`/api/skills?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSkillResults(data.slice(0, 6));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchSkills(query), 300);
    return () => clearTimeout(t);
  }, [query, searchSkills]);

  async function addRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!form.skillId) { toast.error("Select a skill"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: form.skillId,
          minProficiency: form.minProficiency,
          headcount: parseInt(form.headcount),
          priority: form.priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add requirement");
      setRequirements((prev) => [...prev, data]);
      setForm({ skillId: "", skillName: "", minProficiency: "INTERMEDIATE", headcount: "1", priority: "MEDIUM" });
      setQuery("");
      setAdding(false);
      toast.success("Requirement added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeRequirement(id: string) {
    const res = await fetch(`/api/projects/${projectId}/requirements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRequirements((prev) => prev.filter((r) => r.id !== id));
      toast.success("Requirement removed");
    } else {
      toast.error("Failed to remove requirement");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Skill Requirements</CardTitle>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add requirement
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <form onSubmit={addRequirement} className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Skill</Label>
                <Input
                  placeholder="Search skill…"
                  value={form.skillName || query}
                  onChange={(e) => { setQuery(e.target.value); setForm((f) => ({ ...f, skillId: "", skillName: "" })); }}
                />
                {skillResults.length > 0 && !form.skillId && (
                  <div className="border rounded bg-card shadow-sm max-h-36 overflow-y-auto z-10">
                    {skillResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex justify-between"
                        onClick={() => { setForm((f) => ({ ...f, skillId: s.id, skillName: s.name })); setSkillResults([]); setQuery(""); }}
                      >
                        <span>{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Min. proficiency</Label>
                <ProficiencySelector
                  value={form.minProficiency}
                  onChange={(v) => setForm((f) => ({ ...f, minProficiency: v }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Headcount needed</Label>
                <Input
                  type="number" min="1" max="100"
                  value={form.headcount}
                  onChange={(e) => setForm((f) => ({ ...f, headcount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Adding…" : "Add"}
              </Button>
            </div>
          </form>
        )}

        {requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No skill requirements yet. Add some to enable AI gap analysis.
          </p>
        ) : (
          <div className="space-y-2">
            {requirements.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border px-4 py-3 group">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">{req.skill.name}</p>
                    <p className="text-xs text-muted-foreground">{req.skill.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{proficiencyLabel(req.minProficiency)}+</Badge>
                  <Badge variant="outline" className="text-xs">{req.headcount}x</Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[req.priority]}`}>
                    {req.priority}
                  </span>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => removeRequirement(req.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
