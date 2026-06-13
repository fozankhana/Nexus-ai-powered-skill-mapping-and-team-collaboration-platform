import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          members: { where: { userId: session.user.id } },
        },
      },
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              assignee: { select: { id: true, name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (board.team.members.length === 0)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(board);
}

const patchSchema = z.object({ name: z.string().min(1).max(100) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;
  const body = patchSchema.safeParse(await req.json());
  if (!body.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      team: { include: { members: { where: { userId: session.user.id } } } },
    },
  });
  if (!board || board.team.members.length === 0)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.board.update({
    where: { id: boardId },
    data: { name: body.data.name },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { team: { select: { ownerId: true } } },
  });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (board.team.ownerId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.board.delete({ where: { id: boardId } });
  return NextResponse.json({ success: true });
}
