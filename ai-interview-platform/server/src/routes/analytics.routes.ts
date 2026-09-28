import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAnalyticsController } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/", authMiddleware, getAnalyticsController);

export default router;