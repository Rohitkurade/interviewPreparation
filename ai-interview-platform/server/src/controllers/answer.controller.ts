import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { submitAnswer } from "../services/answer.service";

export const submitAnswerController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const questionId = Number(req.params.questionId);
    const { response } = req.body;

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    if (!response || typeof response !== "string") {
      return res.status(400).json({
        message: "Answer response is required",
      });
    }

    const answer = await submitAnswer(
      questionId,
      req.user.userId,
      response
    );

    return res.status(201).json({
      message: "Answer submitted successfully",
      answer,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Question not found"
    ) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};