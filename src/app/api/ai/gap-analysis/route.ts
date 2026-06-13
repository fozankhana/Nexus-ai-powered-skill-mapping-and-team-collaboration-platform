import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runGapAnalysis } from "@/lib/skill-gap";
import { z } from "zod";

const Schema = z.object({ projectId: z.string().min(1) });

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json(null);

  const analysis = await prisma.skillGapAnalysis.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(analysis);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestedById = (session.user as { id: string }).id;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { projectId } = parsed.data;

  const analysis = await prisma.skillGapAnalysis.create({
    data: { projectId, requestedById, status: "PROCESSING" },
  });

  // Run async without blocking the response
  runGapAnalysis(projectId, analysis.id).catch(console.error);

  return NextResponse.json({ id: analysis.id, status: "PROCESSING" }, { status: 202 });
}
