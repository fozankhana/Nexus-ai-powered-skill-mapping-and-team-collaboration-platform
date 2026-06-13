"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProficiencySelector } from "./proficiency-selector";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface AddSkillDialogProps {
  onAdded: () => void;
}

export function AddSkillDialog({ onAdded }: AddSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [proficiency, setProficiency] = useState("INTERMEDIATE");
  const [yearsExp, setYearsExp] = useState("");
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q) { setResults([]); return; }
    const res = await fetch(`/api/skills?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.slice(0, 8));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) { toast.error("Please select a skill"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/user/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: selected.id,
          proficiency,
          yearsExp: yearsExp ? parseFloat(yearsExp) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to add skill");
      }
      toast.success(`${selected.name} added!`);
      setOpen(false);
      setQuery("");
      setSelected(null);
      setProficiency("INTERMEDIATE");
      setYearsExp("");
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error adding skill");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Skill</DialogTitle>
          <DialogDescription className="sr-only">Search for a skill and set your proficiency level.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Search skill</Label>
            <Input
              placeholder="e.g. React, Python, Docker…"
              value={selected ? selected.name : query}
              onChange={(e) => { setSelected(null); setQuery(e.target.value); }}
            />
            {results.length > 0 && !selected && (
              <div className="border rounded-md shadow-sm bg-card max-h-40 overflow-y-auto">
                {results.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center justify-between"
                    onClick={() => { setSelected(skill); setResults([]); }}
                  >
                    <span>{skill.name}</span>
                    <span className="text-xs text-muted-foreground">{skill.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Proficiency</Label>
            <ProficiencySelector value={proficiency} onChange={setProficiency} />
          </div>

          <div className="space-y-2">
            <Label>Years of experience (optional)</Label>
            <Input
              type="number"
              min="0"
              max="50"
              step="0.5"
              placeholder="e.g. 2"
              value={yearsExp}
              onChange={(e) => setYearsExp(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selected}>
              {loading ? "Adding…" : "Add skill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
