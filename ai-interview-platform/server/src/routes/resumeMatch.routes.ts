import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";

import {
  generateResumeMatchController,
  getLatestMatchResultController,
} from "../controllers/resumeMatch.controller";

const router = Router();

router.get(
  "/latest",
  authMiddleware,
  getLatestMatchResultController
);

router.post(
  "/resume/:resumeId/job-description/:jobDescriptionId",
  authMiddleware,
  generateResumeMatchController
);

export default router;