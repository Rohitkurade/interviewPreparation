import { Request, Response } from "express";
import { getUserAnalytics } from "../services/analytics.service";

export const getAnalyticsController = async (
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

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);

    res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};