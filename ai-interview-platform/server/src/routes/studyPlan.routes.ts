import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getStudyPlanController } from "../controllers/studyPlan.controller";

const router = Router();

router.get("/", authMiddleware, getStudyPlanController);

export default router;