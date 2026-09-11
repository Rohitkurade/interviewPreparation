import { Request, Response } from "express";
import { getUserAnalytics } from "../services/analytics.service";
import { generateStudyPlan } from "../services/studyPlan.service";

export const getStudyPlanController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const analytics = await getUserAnalytics(req.user.userId);

    if (analytics.skillPerformance.length === 0) {
      return res.status(400).json({
        message:
          "Complete at least one evaluated interview before generating a study plan.",
      });
    }

    const studyPlan = await generateStudyPlan(
      analytics.skillPerformance
    );

    const parsedStudyPlan = JSON.parse(studyPlan);

    res.status(200).json(parsedStudyPlan);
  } catch (error) {
    console.error("Study plan error:", error);

    res.status(500).json({
      message: "Failed to generate study plan",
    });
  }
};