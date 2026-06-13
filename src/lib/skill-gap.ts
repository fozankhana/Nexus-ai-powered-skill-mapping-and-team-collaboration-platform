import { prisma } from "./prisma";
import { anthropic } from "./claude";
import type { GapAnalysisResult } from "@/types/ai";

const GAP_SYSTEM_PROMPT = `You are a senior engineering manager specializing in team skill assessments.
You analyze the gap between a project's skill requirements and a team's current capabilities.
Always respond with valid JSON only — no markdown fences, no prose outside the JSON.`;

export async function buildGapAnalysisInput(projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      skillRequirements: {
        include: { skill: true },
      },
      team: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  userSkills: { include: { skill: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const requirements = project.skillRequirements.map((r) => ({
    skillName: r.skill.name,
    category: r.skill.category,
    minProficiency: r.minProficiency,
    headcount: r.headcount,
    priority: r.priority,
  }));

  const teamMembers = project.team.members.map((m) => ({
    name: m.user.name ?? m.user.email,
    skills: m.user.userSkills.map((us) => ({
      skillName: us.skill.name,
      proficiency: us.proficiency,
      yearsExp: us.yearsExp,
    })),
  }));

  return {
    projectName: project.name,
    projectDescription: project.description ?? "",
    requirements,
    teamMembers,
  };
}

export async function runGapAnalysis(
  projectId: string,
  analysisId: string
): Promise<void> {
  const input = await buildGapAnalysisInput(projectId);

  const userPrompt = `Analyze the skill gap for the following project and team.

PROJECT: ${input.projectName}
DESCRIPTION: ${input.projectDescription}

REQUIRED SKILLS:
${JSON.stringify(input.requirements, null, 2)}

TEAM MEMBERS AND THEIR SKILLS:
${JSON.stringify(input.teamMembers, null, 2)}

Respond with exactly this JSON structure:
{
  "gapScore": <number 0-100, where 100 = critical gaps, 0 = fully covered>,
  "summary": "<2-3 sentence executive summary>",
  "gaps": [
    {
      "skillName": "<name>",
      "category": "<category>",
      "required": { "proficiency": "<level>", "headcount": <n>, "priority": "<priority>" },
      "available": { "count": <n>, "highestProficiency": "<level or null>" },
      "delta": "<description of the gap or covered>",
      "severity": "<critical|high|medium|low>"
    }
  ],
  "recommendations": [
    {
      "type": "<hire|train|reassign|outsource>",
      "description": "<actionable recommendation>",
      "affectedSkills": ["<skill>"],
      "priority": "<immediate|short_term|long_term>"
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: GAP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const result: GapAnalysisResult = JSON.parse(rawText);

    await prisma.skillGapAnalysis.update({
      where: { id: analysisId },
      data: {
        status: "COMPLETED",
        rawResponse: rawText,
        rawPrompt: userPrompt,
        summary: result.summary,
        gapScore: result.gapScore,
        gaps: result.gaps as object[],
        recommendations: result.recommendations as object[],
      },
    });
  } catch (err) {
    await prisma.skillGapAnalysis.update({
      where: { id: analysisId },
      data: { status: "FAILED" },
    });
    throw err;
  }
}

const LEARNING_SYSTEM_PROMPT = `You are an expert learning coach and curriculum designer.
You create personalized, realistic learning paths based on a person's current skill set and goals.
Always respond with valid JSON only — no markdown fences, no prose outside the JSON.`;

export async function runLearningPathGeneration(
  userId: string,
  pathId: string,
  targetSkillName: string,
  targetProficiency: string,
  context?: string
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      userSkills: { include: { skill: true } },
    },
  });

  const currentSkills = user.userSkills.map((us) => ({
    skillName: us.skill.name,
    proficiency: us.proficiency,
    category: us.skill.category,
  }));

  const userPrompt = `Create a personalized learning path for ${user.name ?? user.email}.

CURRENT SKILLS:
${JSON.stringify(currentSkills, null, 2)}

GOAL: Reach ${targetProficiency} proficiency in "${targetSkillName}"
${context ? `CONTEXT: ${context}` : ""}

Respond with exactly this JSON structure:
{
  "title": "<learning path title>",
  "description": "<2-3 sentence overview>",
  "estimatedWeeks": <number>,
  "steps": [
    {
      "order": <1-based index>,
      "title": "<step title>",
      "description": "<what the learner will do and achieve>",
      "type": "<course|project|reading|practice|mentorship>",
      "estimatedHours": <number>,
      "resourceTitle": "<specific book, course, or project name>",
      "resourceUrl": "<url if well-known, else null>",
      "prerequisiteStepOrders": [<step order numbers>],
      "milestoneOutcome": "<what they can do after this step>"
    }
  ],
  "prerequisites": ["<existing skill the learner already has that helps>"],
  "successMetrics": ["<how to know the learner has achieved the goal>"]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: LEARNING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(rawText);

    await prisma.learningPath.update({
      where: { id: pathId },
      data: {
        status: "COMPLETED",
        rawResponse: rawText,
        title: result.title,
        description: result.description,
        estimatedWeeks: result.estimatedWeeks,
        steps: result.steps,
      },
    });
  } catch (err) {
    await prisma.learningPath.update({
      where: { id: pathId },
      data: { status: "FAILED" },
    });
    throw err;
  }
}
