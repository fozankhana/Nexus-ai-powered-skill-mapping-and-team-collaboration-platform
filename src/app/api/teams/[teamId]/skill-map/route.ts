import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            include: {
              userSkills: { include: { skill: true } },
            },
          },
        },
      },
    },
  });

  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember = team.members.some((m) => m.userId === session.user.id);
  if (!isMember)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const categoryMap: Record<string, Record<string, number>> = {};
  for (const member of team.members) {
    for (const us of member.user.userSkills) {
      const cat = us.skill.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 };
      }
      categoryMap[cat][us.proficiency] =
        (categoryMap[cat][us.proficiency] ?? 0) + 1;
    }
  }

  const heatmap = Object.entries(categoryMap).map(([category, counts]) => ({
    category,
    BEGINNER: counts.BEGINNER ?? 0,
    INTERMEDIATE: counts.INTERMEDIATE ?? 0,
    ADVANCED: counts.ADVANCED ?? 0,
    EXPERT: counts.EXPERT ?? 0,
  }));

  return NextResponse.json({ heatmap });
}
