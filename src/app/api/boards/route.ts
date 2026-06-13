import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateBoardSchema = z.object({
  name: z.string().min(2).max(100),
  teamId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const userId = (session.user as { id: string }).id;

  const boards = await prisma.board.findMany({
    where: {
      ...(teamId ? { teamId } : {}),
      team: { members: { some: { userId } } },
    },
    include: { team: { select: { name: true } }, _count: { select: { columns: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = CreateBoardSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: parsed.data.teamId, userId } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const board = await prisma.board.create({
    data: {
      name: parsed.data.name,
      teamId: parsed.data.teamId,
      columns: {
        createMany: {
          data: [
            { name: "To Do", order: 0, color: "indigo" },
            { name: "In Progress", order: 1, color: "amber" },
            { name: "Done", order: 2, color: "emerald" },
          ],
        },
      },
    },
    include: { columns: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(board, { status: 201 });
}
