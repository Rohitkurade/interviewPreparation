import { prisma } from "../lib/prisma";

export const getUserAnalytics = async (userId: number) => {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
      evaluation: {
        isNot: null,
      },
    },
    include: {
      evaluation: {
        include: {
          skillScores: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const evaluations = interviews
    .map((interview) => interview.evaluation)
    .filter((evaluation) => evaluation !== null);

  if (evaluations.length === 0) {
    return {
      totalInterviews: 0,
      averageScore: 0,
      bestScore: 0,
      scoreHistory: [],
      skillPerformance: [],
    };
  }

  const scores = evaluations.map(
    (evaluation) => evaluation.overallScore
  );

  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) /
    scores.length;

  const bestScore = Math.max(...scores);

  const scoreHistory = interviews.map((interview) => ({
    interviewId: interview.id,
    role: interview.role,
    level: interview.level,
    score: interview.evaluation!.overallScore,
    createdAt: interview.createdAt,
  }));

  const skillMap = new Map<
    string,
    { total: number; count: number }
  >();

  for (const evaluation of evaluations) {
    for (const skill of evaluation.skillScores) {
      const existing = skillMap.get(skill.skill);

      if (existing) {
        existing.total += skill.score;
        existing.count += 1;
      } else {
        skillMap.set(skill.skill, {
          total: skill.score,
          count: 1,
        });
      }
    }
  }

  const skillPerformance = Array.from(skillMap.entries()).map(
    ([skill, data]) => ({
      skill,
      score: Number((data.total / data.count).toFixed(1)),
    })
  );

  return {
    totalInterviews: evaluations.length,
    averageScore: Number(averageScore.toFixed(1)),
    bestScore,
    scoreHistory,
    skillPerformance,
  };
};