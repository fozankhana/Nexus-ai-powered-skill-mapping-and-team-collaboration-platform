"use client";

import { Column } from "./kanban-board";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  column: Column;
  isDraggingOver: boolean;
  onTaskDeleted: (taskId: string) => void;
  children: React.ReactNode;
}

const COLOR_MAP: Record<string, string> = {
  indigo: "border-t-indigo-500",
  amber: "border-t-amber-500",
  emerald: "border-t-emerald-500",
  blue: "border-t-blue-500",
  red: "border-t-red-500",
  purple: "border-t-purple-500",
  gray: "border-t-gray-500",
};

export function KanbanColumn({ column, isDraggingOver, children }: KanbanColumnProps) {
  const borderColor = COLOR_MAP[column.color] ?? "border-t-primary";

  return (
    <div
      className={`flex flex-col rounded-xl border-t-4 bg-muted/50 ${borderColor} min-h-[200px] transition-colors ${
        isDraggingOver ? "bg-muted" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-sm font-semibold">{column.name}</span>
        <Badge variant="secondary" className="text-xs">
          {column.tasks.length}
        </Badge>
      </div>
      <div className="flex-1 px-3 pb-3 space-y-0">
        {children}
      </div>
    </div>
  );
}
