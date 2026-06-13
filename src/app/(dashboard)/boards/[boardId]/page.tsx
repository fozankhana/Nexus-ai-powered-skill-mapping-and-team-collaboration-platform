import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard, Column } from "@/components/boards/kanban-board";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

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

  if (!board) notFound();
  if (board.team.members.length === 0) notFound();

  const columns: Column[] = board.columns.map((col) => ({
    id: col.id,
    name: col.name,
    color: col.color ?? "gray",
    order: col.order,
    tasks: col.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      order: task.order,
      columnId: task.columnId,
      assignee: task.assignee,
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={board.name}
        description={`Team: ${board.team.name}`}
      />
      <KanbanBoard boardId={board.id} initialColumns={columns} />
    </div>
  );
}
