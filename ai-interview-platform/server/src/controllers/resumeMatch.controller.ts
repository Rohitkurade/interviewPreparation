import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateResumeMatch } from "../services/resumeMatch.service";

export const generateResumeMatchController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const resumeId = Number(req.params.resumeId);
    const jobDescriptionId = Number(req.params.jobDescriptionId);

    if (
      !Number.isInteger(resumeId) ||
      resumeId <= 0 ||
      !Number.isInteger(jobDescriptionId) ||
      jobDescriptionId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid resume or job description ID",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user.userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const jobDescription = await prisma.jobDescription.findFirst({
      where: {
        id: jobDescriptionId,
        userId: req.user.userId,
      },
    });

    if (!jobDescription) {
      return res.status(404).json({
        message: "Job description not found",
      });
    }

    if (!resume.analysis) {
      return res.status(400).json({
        message: "Analyze the resume before matching",
      });
    }

    if (!jobDescription.analysis) {
      return res.status(400).json({
        message: "Analyze the job description before matching",
      });
    }

    const match = await generateResumeMatch(
      resume.analysis,
      jobDescription.analysis
    );

    const parsedMatch = JSON.parse(match);

    const matchResult = await prisma.matchResult.create({
      data: {
        matchScore: parsedMatch.matchScore,
        matchedSkills: parsedMatch.matchedSkills,
        missingSkills: parsedMatch.missingSkills,
        additionalSkills: parsedMatch.additionalSkills,
        analysis: parsedMatch.analysis,
        resumeId: resume.id,
        jobDescriptionId: jobDescription.id,
      },
    });

    res.status(201).json({
      message: "Resume and job description matched successfully",
      matchResultId: matchResult.id,
      match: parsedMatch,
    });
  } catch (error) {
    console.error("Resume match error:", error);

    res.status(500).json({
      message: "Failed to generate resume match",
    });
  }
};
export const getLatestMatchResultController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const matchResult = await prisma.matchResult.findFirst({
      where: {
        resume: {
          userId: req.user.userId,
        },
        jobDescription: {
          userId: req.user.userId,
        },
      },
      include: {
        resume: true,
        jobDescription: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!matchResult) {
      return res.status(404).json({
        message: "No resume-job match found",
      });
    }

    return res.status(200).json({
      matchResult,
    });
  } catch (error) {
    console.error("Get latest match result error:", error);

    return res.status(500).json({
      message: "Failed to fetch latest match result",
    });
  }
};