import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const createJobDescriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { title, company, description } = req.body;

    if (!description || typeof description !== "string") {
      return res.status(400).json({
        message: "Job description is required",
      });
    }

    if (description.trim().length < 50) {
      return res.status(400).json({
        message: "Job description is too short",
      });
    }

    const jobDescription = await prisma.jobDescription.create({
      data: {
        title: title?.trim() || null,
        company: company?.trim() || null,
        description: description.trim(),
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: "Job description saved successfully",
      jobDescription: {
        id: jobDescription.id,
        title: jobDescription.title,
        company: jobDescription.company,
        description: jobDescription.description,
        createdAt: jobDescription.createdAt,
      },
    });
  } catch (error) {
    console.error("Job description error:", error);

    res.status(500).json({
      message: "Failed to save job description",
    });
  }
};