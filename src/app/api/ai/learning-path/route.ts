import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runLearningPathGeneration } from "@/lib/skill-gap";
import { z } from "zod";

const Schema = z.object({
  targetSkillId: z.string().min(1),
  targetProficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  context: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const paths = await prisma.learningPath.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { targetSkill: { select: { name: true } } },
  });

  return NextResponse.json(paths);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const skill = await prisma.skill.findUnique({ where: { id: parsed.data.targetSkillId } });
  if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });

  const path = await prisma.learningPath.create({
    data: {
      userId,
      title: `Learning ${skill.name}`,
      targetSkillId: skill.id,
      status: "PROCESSING",
    },
  });

  runLearningPathGeneration(
    userId,
    path.id,
    skill.name,
    parsed.data.targetProficiency,
    parsed.data.context
  ).catch(console.error);

  return NextResponse.json({ id: path.id, status: "PROCESSING" }, { status: 202 });
}
