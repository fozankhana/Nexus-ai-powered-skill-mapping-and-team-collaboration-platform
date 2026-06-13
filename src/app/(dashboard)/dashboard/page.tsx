import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Users,
  FolderKanban,
  GraduationCap,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatDate, proficiencyLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats(userId: string) {
  const [skillCount, teamCount, projectCount, learningPathCount, recentSkills, recentTeams] =
    await Promise.all([
      prisma.userSkill.count({ where: { userId } }),
      prisma.teamMember.count({ where: { userId } }),
      prisma.project.count({
        where: {
          team: { members: { some: { userId } } },
          status: { in: ["PLANNING", "ACTIVE"] },
        },
      }),
      prisma.learningPath.count({ where: { userId } }),
      prisma.userSkill.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { skill: true },
      }),
      prisma.teamMember.findMany({
        where: { userId },
        take: 3,
        orderBy: { joinedAt: "desc" },
        include: { team: true },
      }),
    ]);

  return { skillCount, teamCount, projectCount, learningPathCount, recentSkills, recentTeams };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const stats = await getStats(session.user.id);

  const statCards = [
    {
      title: "Skills",
      value: stats.skillCount,
      icon: Layers,
      href: "/skills",
      color: "text-blue-500",
    },
    {
      title: "Teams",
      value: stats.teamCount,
      icon: Users,
      href: "/teams",
      color: "text-green-500",
    },
    {
      title: "Active Projects",
      value: stats.projectCount,
      icon: FolderKanban,
      href: "/projects",
      color: "text-amber-500",
    },
    {
      title: "Learning Paths",
      value: stats.learningPathCount,
      icon: GraduationCap,
      href: "/learning",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session.user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your skill profile and team activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, href, color }) => (
          <Link key={title} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Skills</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/skills">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentSkills.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-muted-foreground text-sm">No skills added yet.</p>
                <Button size="sm" asChild>
                  <Link href="/skills">
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first skill
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {stats.recentSkills.map(({ id, skill, proficiency }) => (
                  <li key={id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">{skill.category}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {proficiencyLabel(proficiency)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Teams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Your Teams</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teams">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentTeams.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-muted-foreground text-sm">Not a member of any teams yet.</p>
                <Button size="sm" asChild>
                  <Link href="/teams/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a team
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {stats.recentTeams.map(({ team, teamRole, joinedAt }) => (
                  <li key={team.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/teams/${team.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {team.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDate(joinedAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {teamRole.toLowerCase()}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/skills">
              <Plus className="mr-2 h-4 w-4" />
              Add skill
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/teams/new">
              <Plus className="mr-2 h-4 w-4" />
              Create team
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/boards">
              <Plus className="mr-2 h-4 w-4" />
              New board
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/learning">
              <GraduationCap className="mr-2 h-4 w-4" />
              Learning paths
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
