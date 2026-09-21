import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { analyzeResume } from "../services/resumeAnalysis.service";

export const analyzeResumeController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const resumeId = Number(req.params.id);

    if (!Number.isInteger(resumeId) || resumeId <= 0) {
      return res.status(400).json({
        message: "Invalid resume ID",
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

    if (!resume.resumeText || resume.resumeText.trim().length < 50) {
      return res.status(400).json({
        message: "Resume text is too short to analyze",
      });
    }

    const analysis = await analyzeResume(resume.resumeText);

    const parsedAnalysis = JSON.parse(analysis);

    const updatedResume = await prisma.resume.update({
      where: {
        id: resume.id,
      },
      data: {
        analysis: parsedAnalysis,
      },
    });

    res.status(200).json({
      message: "Resume analyzed successfully",
      resumeId: updatedResume.id,
      analysis: parsedAnalysis,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    res.status(500).json({
      message: "Failed to analyze resume",
    });
  }
};