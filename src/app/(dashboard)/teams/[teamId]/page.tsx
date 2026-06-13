import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { TeamSkillHeatmapWrapper } from "@/components/teams/team-skill-heatmap-wrapper";
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog";
import Link from "next/link";
import { FolderKanban, Plus, LayoutGrid } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface TeamPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: session.user.id } },
  });
  if (!membership) notFound();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
      projects: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      boards: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
  if (!team) notFound();

  const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(membership.teamRole);

  return (
    <div className="space-y-6">
      <PageHeader title={team.name} description={team.description ?? undefined}>
        {isOwnerOrAdmin && <InviteMemberDialog teamId={teamId} />}
      </PageHeader>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members ({team.members.length})</TabsTrigger>
          <TabsTrigger value="skill-map">Skill Map</TabsTrigger>
          <TabsTrigger value="projects">Projects ({team.projects.length})</TabsTrigger>
          <TabsTrigger value="boards">Boards ({team.boards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {team.members.map(({ user, teamRole, joinedAt }) => {
                  const initials = (user.name ?? user.email ?? "U")
                    .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <li key={user.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          Joined {formatDate(joinedAt)}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {teamRole.toLowerCase()}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skill-map" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Skill Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamSkillHeatmapWrapper teamId={teamId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" asChild>
              <Link href={`/projects/new?teamId=${teamId}`}>
                <Plus className="mr-2 h-4 w-4" />
                New project
              </Link>
            </Button>
          </div>
          {team.projects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No projects yet. Create one to run AI gap analyses.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {team.projects.map((project) => (
                <Card key={project.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {project.status.toLowerCase()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/projects/${project.id}`}>
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Open
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="boards" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" asChild>
              <Link href={`/boards?teamId=${teamId}`}>
                <Plus className="mr-2 h-4 w-4" />
                New board
              </Link>
            </Button>
          </div>
          {team.boards.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No boards yet. Create a Kanban board to track work.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {team.boards.map((board) => (
                <Card key={board.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="font-medium text-sm">{board.name}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/boards/${board.id}`}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Open
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
