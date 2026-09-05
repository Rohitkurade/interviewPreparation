import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { evaluateInterview } from "../services/evaluation.service";

export const evaluateInterviewController = async (
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

    const evaluation = await evaluateInterview(
      interviewId,
      req.user.userId
    );

    return res.status(201).json({
      message: "Interview evaluated successfully",
      evaluation,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Interview not found"
    ) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "All questions must be answered"
    ) {
      return res.status(400).json({
        message: "All questions must be answered before evaluation",
      });
    }

    if (
      error instanceof Error &&
      error.message === "AI returned invalid evaluation format"
    ) {
      return res.status(500).json({
        message: "AI returned invalid evaluation format",
      });
    }

    return res.status(500).json({
      message: "Failed to evaluate interview",
    });
  }
};