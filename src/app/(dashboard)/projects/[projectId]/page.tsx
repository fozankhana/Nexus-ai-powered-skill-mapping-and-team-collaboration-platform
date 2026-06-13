import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { SkillRequirementsPanel } from "@/components/projects/skill-requirements-panel";
import { Brain, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning", ACTIVE: "Active", ON_HOLD: "On Hold",
  COMPLETED: "Completed", ARCHIVED: "Archived",
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: { members: { select: { userId: true } } },
      },
      skillRequirements: {
        include: { skill: true },
        orderBy: { priority: "desc" },
      },
      gapAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project) notFound();

  const isMember = project.team.members.some((m) => m.userId === session.user.id);
  if (!isMember) notFound();

  const latestAnalysis = project.gapAnalyses[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title={project.name} description={project.description ?? undefined}>
        <Badge className="capitalize" variant="secondary">
          {STATUS_LABELS[project.status] ?? project.status}
        </Badge>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Team</p>
            <Link href={`/teams/${project.teamId}`} className="font-medium hover:underline flex items-center gap-1">
              {project.team.name} <ExternalLink className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Skill Requirements</p>
            <p className="font-bold text-2xl">{project.skillRequirements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Last Updated</p>
            <p className="font-medium">{formatDate(project.updatedAt)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gap Analysis CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Skill Gap Analysis
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {latestAnalysis
                ? `Last run ${formatDate(latestAnalysis.createdAt)}. Score: ${latestAnalysis.gapScore?.toFixed(0) ?? "—"}/100`
                : "Identify exactly which skills your team is missing for this project."}
            </p>
          </div>
          <Button asChild>
            <Link href={`/projects/${projectId}/gap-analysis`}>
              {latestAnalysis ? "View analysis" : "Run analysis"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Skill Requirements */}
      <SkillRequirementsPanel
        projectId={projectId}
        initialRequirements={project.skillRequirements}
      />
    </div>
  );
}
