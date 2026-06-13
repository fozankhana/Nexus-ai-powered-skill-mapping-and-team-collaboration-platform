import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const analysis = await prisma.skillGapAnalysis.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      summary: true,
      gapScore: true,
      gaps: true,
      recommendations: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!analysis) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(analysis);
}
