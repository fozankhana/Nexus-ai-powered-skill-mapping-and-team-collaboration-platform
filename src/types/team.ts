import type { Team, TeamMember, User, UserSkill, Skill } from "@prisma/client";

export interface TeamWithMemberCount extends Team {
  _count: { members: number };
}

export interface TeamMemberWithUser extends TeamMember {
  user: User & {
    userSkills: (UserSkill & { skill: Skill })[];
  };
}

export interface TeamSkillMapEntry {
  category: string;
  BEGINNER: number;
  INTERMEDIATE: number;
  ADVANCED: number;
  EXPERT: number;
}
