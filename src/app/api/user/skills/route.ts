import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AddSkillSchema = z.object({
  skillId: z.string().min(1),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  yearsExp: z.number().min(0).max(50).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
    orderBy: { skill: { name: "asc" } },
  });

  return NextResponse.json(userSkills);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = AddSkillSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userSkill = await prisma.userSkill.create({
    data: { userId, ...parsed.data },
    include: { skill: true },
  });

  return NextResponse.json(userSkill, { status: 201 });
}
