import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { columnId } = await params;
  const { name, color, order } = await req.json();

  const column = await prisma.boardColumn.update({
    where: { id: columnId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(order !== undefined ? { order } : {}),
    },
  });

  return NextResponse.json(column);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { columnId } = await params;
  await prisma.boardColumn.delete({ where: { id: columnId } });
  return NextResponse.json({ success: true });
}
