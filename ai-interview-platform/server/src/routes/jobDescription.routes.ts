import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createJobDescriptionController,
} from "../controllers/jobDescription.controller";
import {
  analyzeJobDescriptionController,
} from "../controllers/jobDescriptionAnalysis.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createJobDescriptionController
);

router.post(
  "/:id/analyze",
  authMiddleware,
  analyzeJobDescriptionController
);

export default router;