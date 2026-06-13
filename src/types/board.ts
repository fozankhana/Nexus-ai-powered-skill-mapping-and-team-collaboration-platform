import type { Board, BoardColumn, BoardTask, User, Skill, TaskSkillRequirement } from "@prisma/client";

export interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[];
}

export interface ColumnWithTasks extends BoardColumn {
  tasks: TaskWithDetails[];
}

export interface TaskWithDetails extends BoardTask {
  assignee: User | null;
  creator: User;
  skills: (TaskSkillRequirement & { skill: Skill })[];
}
