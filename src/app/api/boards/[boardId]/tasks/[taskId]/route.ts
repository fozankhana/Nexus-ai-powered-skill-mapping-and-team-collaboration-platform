import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  columnId: z.string().optional(),
  order: z.number().int().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

async function checkBoardMembership(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      team: { include: { members: { where: { userId } } } },
    },
  });
  return board && board.team.members.length > 0 ? board : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, taskId } = await params;
  const body = patchSchema.safeParse(await req.json());
  if (!body.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const board = await checkBoardMembership(boardId, session.user.id);
  if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updateData: Record<string, unknown> = {};
  const d = body.data;
  if (d.columnId !== undefined) updateData.columnId = d.columnId;
  if (d.order !== undefined) updateData.order = d.order;
  if (d.title !== undefined) updateData.title = d.title;
  if (d.description !== undefined) updateData.description = d.description;
  if (d.priority !== undefined) updateData.priority = d.priority;
  if (d.dueDate !== undefined)
    updateData.dueDate = d.dueDate ? new Date(d.dueDate) : null;
  if (d.assigneeId !== undefined) updateData.assigneeId = d.assigneeId;

  const task = await prisma.boardTask.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignee: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, taskId } = await params;

  const board = await checkBoardMembership(boardId, session.user.id);
  if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.boardTask.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
