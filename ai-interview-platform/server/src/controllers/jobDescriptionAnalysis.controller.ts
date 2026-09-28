import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { analyzeJobDescription } from "../services/jobDescriptionAnalysis.service.js";

export const analyzeJobDescriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const jobDescriptionId = Number(req.params.id);

    if (
      !Number.isInteger(jobDescriptionId) ||
      jobDescriptionId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid job description ID",
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

    if (
      !jobDescription.description ||
      jobDescription.description.trim().length < 50
    ) {
      return res.status(400).json({
        message: "Job description is too short to analyze",
      });
    }

    const analysis = await analyzeJobDescription(
      jobDescription.description
    );

    const parsedAnalysis = JSON.parse(analysis);

    const updatedJobDescription =
      await prisma.jobDescription.update({
        where: {
          id: jobDescription.id,
        },
        data: {
          analysis: parsedAnalysis,
        },
      });

    res.status(200).json({
      message: "Job description analyzed successfully",
      jobDescriptionId: updatedJobDescription.id,
      analysis: parsedAnalysis,
    });
  } catch (error) {
    console.error("Job description analysis error:", error);

    res.status(500).json({
      message: "Failed to analyze job description",
    });
  }
};