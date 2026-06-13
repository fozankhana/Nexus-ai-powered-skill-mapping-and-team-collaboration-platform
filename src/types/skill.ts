import type { Skill, UserSkill, Proficiency } from "@prisma/client";

export interface SkillWithUserCount extends Skill {
  _count: { userSkills: number };
}

export interface UserSkillWithSkill extends UserSkill {
  skill: Skill;
}

export interface RadarSkill {
  subject: string;
  value: number;
  fullMark: 4;
}

export const PROFICIENCY_LEVELS: Proficiency[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

export const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "DevOps",
  "Data Science",
  "Design",
  "Mobile",
  "Security",
  "Management",
  "Other",
] as const;
