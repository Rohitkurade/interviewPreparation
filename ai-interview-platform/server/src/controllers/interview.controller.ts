import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  createInterview,
  getInterviewById,
  getUserInterviews,
} from "../services/interview.service.js";
import { generateInterviewQuestions } from "../services/ai.service.js";
import { prisma } from "../lib/prisma.js";


export const createInterviewController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { role, level, totalQuestions, matchResultId } = req.body;

    if (!role || !level || !totalQuestions) {
      return res.status(400).json({
        message: "Role, level and totalQuestions are required",
      });
    }
    let validatedMatchResultId: number | null = null;

if (matchResultId !== undefined && matchResultId !== null) {
  const parsedMatchResultId = Number(matchResultId);

  if (
    !Number.isInteger(parsedMatchResultId) ||
    parsedMatchResultId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid matchResultId",
    });
  }

  const matchResult = await prisma.matchResult.findFirst({
    where: {
      id: parsedMatchResultId,
      resume: {
        userId: req.user.userId,
      },
    },
  });

  if (!matchResult) {
    return res.status(404).json({
      message: "Match result not found",
    });
  }

  validatedMatchResultId = parsedMatchResultId;
}


    if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 20) {
      return res.status(400).json({
        message: "totalQuestions must be an integer between 1 and 20",
      });
    }

    const interview = await createInterview(
  req.user.userId,
  role,
  level,
  totalQuestions,
  validatedMatchResultId
);

    return res.status(201).json({
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getInterviewController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const interviewId = Number(req.params.id);

    if (!Number.isInteger(interviewId) || interviewId <= 0) {
      return res.status(400).json({
        message: "Invalid interview ID",
      });
    }

    const interview = await getInterviewById(
      interviewId,
      req.user.userId
    );

    return res.status(200).json({
      interview,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Interview not found"
    ) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const generateQuestionsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const interviewId = Number(req.params.id);

    if (!Number.isInteger(interviewId) || interviewId <= 0) {
      return res.status(400).json({
        message: "Invalid interview ID",
      });
    }

    const interview = await prisma.interview.findFirst({
  where: {
    id: interviewId,
    userId: req.user.userId,
  },
  include: {
    matchResult: {
      include: {
        resume: true,
        jobDescription: true,
      },
    },
  },
});

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const aiResponse = await generateInterviewQuestions(
  interview.role,
  interview.level,
  interview.totalQuestions,
  interview.matchResult
    ? {
        resumeAnalysis: interview.matchResult.resume.analysis,
        jobDescriptionAnalysis: interview.matchResult.jobDescription.analysis,
        matchResult: {
          matchScore: interview.matchResult.matchScore,
          matchedSkills: interview.matchResult.matchedSkills,
          missingSkills: interview.matchResult.missingSkills,
          additionalSkills: interview.matchResult.additionalSkills,
          analysis: interview.matchResult.analysis,
        },
      }
    : undefined
);

    let parsedResponse;

try {
  parsedResponse = JSON.parse(aiResponse);
} catch {
  return res.status(500).json({
    message: "AI returned invalid question format",
  });
}

const questions = parsedResponse.questions;

if (!Array.isArray(questions)) {
  return res.status(500).json({
    message: "AI returned invalid question format",
  });
}

    await prisma.question.deleteMany({
      where: {
        interviewId,
      },
    });

    const createdQuestions = await prisma.question.createManyAndReturn({
      data: questions.map((item, index) => ({
        question: item.question,
        order: index + 1,
        interviewId,
      })),
    });

    return res.status(201).json({
      message: "Interview questions generated successfully",
      questions: createdQuestions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to generate interview questions",
    });
  }
};
export const getUserInterviewsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const interviews = await getUserInterviews(
      req.user.userId
    );

    return res.status(200).json({
      interviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch interviews",
    });
  }
};