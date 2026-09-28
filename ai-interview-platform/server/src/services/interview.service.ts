import { InterviewLevel, InterviewRole } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export const createInterview = async (
  userId: number,
  role: InterviewRole,
  level: InterviewLevel,
  totalQuestions: number,
  matchResultId: number | null = null
) => {
  const interview = await prisma.interview.create({
    data: {
      userId,
      role,
      level,
      totalQuestions,
      matchResultId,
    },
  });

  return interview;
};
export const getInterviewById = async (
  interviewId: number,
  userId: number
) => {
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      userId: userId,
    },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
        include: {
          answer: true,
        },
      },
      evaluation: {
        include: {
          skillScores: true,
        },
      },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  return interview;
};
export const getUserInterviews = async (userId: number) => {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
    },
    include: {
      evaluation: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return interviews;
};