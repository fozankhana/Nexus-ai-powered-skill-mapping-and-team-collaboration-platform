"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { CreateTaskDialog } from "./create-task-dialog";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
  order: number;
  columnId: string;
  assignee?: { id: string; name: string | null; image: string | null } | null;
}

export interface Column {
  id: string;
  name: string;
  color: string;
  order: number;
  tasks: Task[];
}

interface KanbanBoardProps {
  boardId: string;
  initialColumns: Column[];
}

export function KanbanBoard({ boardId, initialColumns }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(
    [...initialColumns].sort((a, b) => a.order - b.order)
  );

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, source, destination } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const sourceCol = columns.find((c) => c.id === source.droppableId)!;
      const destCol = columns.find((c) => c.id === destination.droppableId)!;

      const task = sourceCol.tasks[source.index];

      // Optimistic update
      const newColumns = columns.map((col) => {
        if (col.id === source.droppableId && col.id === destination.droppableId) {
          const tasks = [...col.tasks];
          tasks.splice(source.index, 1);
          tasks.splice(destination.index, 0, { ...task, columnId: destination.droppableId });
          return { ...col, tasks };
        }
        if (col.id === source.droppableId) {
          const tasks = col.tasks.filter((_, i) => i !== source.index);
          return { ...col, tasks };
        }
        if (col.id === destination.droppableId) {
          const tasks = [...col.tasks];
          tasks.splice(destination.index, 0, { ...task, columnId: destination.droppableId });
          return { ...col, tasks };
        }
        return col;
      });
      setColumns(newColumns);

      try {
        const res = await fetch(`/api/boards/${boardId}/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId: destination.droppableId,
            order: destination.index,
          }),
        });
        if (!res.ok) throw new Error("Move failed");
      } catch {
        setColumns(columns); // rollback
        toast.error("Failed to move task");
      }
    },
    [columns, boardId]
  );

  function handleTaskCreated(task: Task) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === task.columnId ? { ...col, tasks: [...col.tasks, task] } : col
      )
    );
  }

  function handleTaskDeleted(taskId: string, columnId: string) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) } : col
      )
    );
  }

  const firstColumnId = columns[0]?.id ?? "";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateTaskDialog
          boardId={boardId}
          columns={columns}
          defaultColumnId={firstColumnId}
          onCreated={handleTaskCreated}
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-shrink-0 w-72"
                >
                  <KanbanColumn
                    column={col}
                    isDraggingOver={snapshot.isDraggingOver}
                    onTaskDeleted={(id) => handleTaskDeleted(id, col.id)}
                  >
                    {col.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={dragProvided.draggableProps.style as React.CSSProperties}
                            className={`mb-2 ${dragSnapshot.isDragging ? "opacity-80 rotate-1" : ""}`}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </KanbanColumn>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const PRIORITY_DOT: Record<string, string> = {
    LOW: "bg-gray-400",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-amber-500",
    CRITICAL: "bg-red-500",
  };

  return (
    <div className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? "bg-gray-400"}`} title={task.priority} />
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      )}
      {task.dueDate && (
        <p className="text-xs text-muted-foreground mt-2">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
