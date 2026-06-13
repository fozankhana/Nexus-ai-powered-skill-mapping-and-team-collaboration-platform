import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillRadarChart } from "@/components/skills/skill-radar-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { proficiencyLabel } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      userSkills: {
        include: { skill: true },
        orderBy: [{ skill: { category: "asc" } }, { skill: { name: "asc" } }],
      },
    },
  });
  if (!user) notFound();

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const byCategory = user.userSkills.reduce<Record<string, typeof user.userSkills>>((acc, us) => {
    const cat = us.skill.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(us);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="My Profile" description="Your public skill profile" />

      {/* Profile header */}
      <Card>
        <CardContent className="p-6 flex items-start gap-5">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{user.name ?? "—"}</h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            {user.profile?.title && (
              <p className="text-sm font-medium">{user.profile.title}</p>
            )}
            {user.profile?.department && (
              <Badge variant="secondary" className="text-xs">
                {user.profile.department}
              </Badge>
            )}
            {user.bio && <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Radar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skill Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillRadarChart userSkills={user.userSkills} />
        </CardContent>
      </Card>

      {/* Skills by category */}
      {Object.keys(byCategory).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-muted-foreground text-sm">No skills on your profile yet.</p>
            <Button asChild>
              <Link href="/skills">
                <Layers className="mr-2 h-4 w-4" />
                Add skills
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Skills ({user.userSkills.length})</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/skills">Manage skills</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(byCategory).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((us) => (
                    <Badge key={us.id} variant="secondary" className="text-xs">
                      {us.skill.name}{" "}
                      <span className="ml-1 text-muted-foreground">
                        · {proficiencyLabel(us.proficiency)}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
