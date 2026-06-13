import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateColumnSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;
  const body = await req.json();
  const parsed = CreateColumnSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lastColumn = await prisma.boardColumn.findFirst({
    where: { boardId },
    orderBy: { order: "desc" },
  });

  const column = await prisma.boardColumn.create({
    data: {
      boardId,
      name: parsed.data.name,
      color: parsed.data.color,
      order: (lastColumn?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(column, { status: 201 });
}
