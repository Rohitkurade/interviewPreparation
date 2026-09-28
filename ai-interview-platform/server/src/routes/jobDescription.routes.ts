import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createJobDescriptionController,
} from "../controllers/jobDescription.controller.js";
import {
  analyzeJobDescriptionController,
} from "../controllers/jobDescriptionAnalysis.controller.js";

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