import { Router } from "express";
import {
  createInterviewController,
  getInterviewController,
  generateQuestionsController,
  getUserInterviewsController,
} from "../controllers/interview.controller.js";
import { submitAnswerController } from "../controllers/answer.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { evaluateInterviewController } from "../controllers/evaluation.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createInterviewController
);

router.get(
  "/",
  authMiddleware,
  getUserInterviewsController
);

router.get(
  "/:id",
  authMiddleware,
  getInterviewController
);

router.post(
  "/:id/generate-questions",
  authMiddleware,
  generateQuestionsController
);

router.post(
  "/questions/:questionId/answer",
  authMiddleware,
  submitAnswerController
);

router.post(
  "/:id/evaluate",
  authMiddleware,
  evaluateInterviewController
);


export default router;