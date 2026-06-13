"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LayoutGrid, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Board { id: string; name: string; team: { name: string }; _count: { columns: number } }
interface Team { id: string; name: string }

export default function BoardsPage() {
  const searchParams = useSearchParams();
  const preTeamId = searchParams.get("teamId") ?? "";

  const [boards, setBoards] = useState<Board[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(preTeamId !== "");
  const [form, setForm] = useState({ name: "", teamId: preTeamId });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/boards").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]).then(([b, t]) => {
      setBoards(b);
      setTeams(t);
      setLoading(false);
    });
  }, []);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!form.teamId) { toast.error("Select a team"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create board");
      toast.success("Board created!");
      setBoards((prev) => [data, ...prev]);
      setCreating(false);
      setForm({ name: "", teamId: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Boards" description="Kanban boards for tracking team work.">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Board
        </Button>
      </PageHeader>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Board</DialogTitle>
            <DialogDescription className="sr-only">Enter a name and select a team to create a new Kanban board.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createBoard} className="space-y-4">
            <div className="space-y-2">
              <Label>Board name *</Label>
              <Input
                placeholder="Sprint 1, Q3 Work, etc."
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Team *</Label>
              <Select value={form.teamId} onValueChange={(v) => setForm((f) => ({ ...f, teamId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>
                  {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : boards.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No boards yet"
          description="Create a Kanban board to start tracking your team's work."
        >
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create first board
          </Button>
        </EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <Card key={board.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{board.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{board.team.name}</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/boards/${board.id}`}>
                    Open board <ArrowRight className="ml-2 h-3 w-3" />
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
