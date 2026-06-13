import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateRoleSchema = z.object({
  teamRole: z.enum(["ADMIN", "MEMBER"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserId = (session.user as { id: string }).id;
  const { teamId, userId } = await params;

  const myMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: currentUserId } },
  });
  if (!myMembership || myMembership.teamRole !== "OWNER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = UpdateRoleSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { teamRole: parsed.data.teamRole },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserId = (session.user as { id: string }).id;
  const { teamId, userId } = await params;

  const myMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: currentUserId } },
  });
  const isOwnerOrAdmin =
    myMembership && ["OWNER", "ADMIN"].includes(myMembership.teamRole);
  const isSelf = currentUserId === userId;

  if (!isOwnerOrAdmin && !isSelf)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.teamRole === "OWNER")
    return NextResponse.json({ error: "Cannot remove team owner" }, { status: 400 });

  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
  return NextResponse.json({ success: true });
}
