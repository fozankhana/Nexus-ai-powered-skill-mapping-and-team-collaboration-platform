import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateTaskSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  skillIds: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const creatorId = (session.user as { id: string }).id;
  const { boardId } = await params;
  const body = await req.json();
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { skillIds, dueDate, ...data } = parsed.data;

  const lastTask = await prisma.boardTask.findFirst({
    where: { columnId: parsed.data.columnId },
    orderBy: { order: "desc" },
  });

  const task = await prisma.boardTask.create({
    data: {
      ...data,
      boardId,
      creatorId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      order: (lastTask?.order ?? -1) + 1,
      ...(skillIds?.length
        ? {
            skills: {
              createMany: {
                data: skillIds.map((skillId) => ({ skillId })),
              },
            },
          }
        : {}),
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
      skills: { include: { skill: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
