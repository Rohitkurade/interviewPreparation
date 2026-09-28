import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  generateResumeMatchController,
  getLatestMatchResultController,
} from "../controllers/resumeMatch.controller.js";

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