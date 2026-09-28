import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getStudyPlanController } from "../controllers/studyPlan.controller.js";

const router = Router();

router.get("/", authMiddleware, getStudyPlanController);

export default router;