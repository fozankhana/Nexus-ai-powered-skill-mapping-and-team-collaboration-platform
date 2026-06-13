"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AddSkillDialog } from "@/components/skills/add-skill-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, Trash2 } from "lucide-react";
import { proficiencyLabel } from "@/lib/utils";
import { toast } from "sonner";

interface UserSkill {
  id: string;
  proficiency: string;
  yearsExp?: number | null;
  skill: { id: string; name: string; category: string };
}

const PROFICIENCY_COLOR: Record<string, string> = {
  BEGINNER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  INTERMEDIATE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  ADVANCED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  EXPERT: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function SkillsPage() {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/user/skills");
    const data = await res.json();
    setUserSkills(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  async function deleteSkill(id: string, name: string) {
    if (!confirm(`Remove ${name} from your profile?`)) return;
    const res = await fetch(`/api/user/skills/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`${name} removed`);
      fetchSkills();
    } else {
      toast.error("Failed to remove skill");
    }
  }

  const byCategory = userSkills.reduce<Record<string, UserSkill[]>>((acc, us) => {
    const cat = us.skill.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(us);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="My Skills"
        description="Manage the skills in your professional profile."
      >
        <AddSkillDialog onAdded={fetchSkills} />
      </PageHeader>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : userSkills.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No skills yet"
          description="Add skills to your profile so teams can see your strengths."
        >
          <AddSkillDialog onAdded={fetchSkills} />
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, skills]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.map((us) => (
                  <Card key={us.id} className="group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{us.skill.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROFICIENCY_COLOR[us.proficiency]}`}>
                            {proficiencyLabel(us.proficiency)}
                          </span>
                          {us.yearsExp != null && (
                            <span className="text-xs text-muted-foreground">
                              {us.yearsExp}y exp
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => deleteSkill(us.id, us.skill.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
