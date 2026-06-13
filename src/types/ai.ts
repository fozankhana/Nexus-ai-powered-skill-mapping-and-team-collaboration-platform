export interface GapEntry {
  skillName: string;
  category: string;
  required: {
    proficiency: string;
    headcount: number;
    priority: string;
  };
  available: {
    count: number;
    highestProficiency: string | null;
  };
  delta: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface GapRecommendation {
  type: "hire" | "train" | "reassign" | "outsource";
  description: string;
  affectedSkills: string[];
  priority: "immediate" | "short_term" | "long_term";
}

export interface GapAnalysisResult {
  gapScore: number;
  summary: string;
  gaps: GapEntry[];
  recommendations: GapRecommendation[];
}

export interface LearningStep {
  order: number;
  title: string;
  description: string;
  type: "course" | "project" | "reading" | "practice" | "mentorship";
  estimatedHours: number;
  resourceTitle: string;
  resourceUrl: string | null;
  prerequisiteStepOrders: number[];
  milestoneOutcome: string;
}

export interface LearningPathResult {
  title: string;
  description: string;
  estimatedWeeks: number;
  steps: LearningStep[];
  prerequisites: string[];
  successMetrics: string[];
}
