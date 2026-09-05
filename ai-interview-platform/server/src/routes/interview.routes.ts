import { Router } from "express";
import {
  createInterviewController,
  getInterviewController,
  generateQuestionsController,
  getUserInterviewsController,
} from "../controllers/interview.controller";
import { submitAnswerController } from "../controllers/answer.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { evaluateInterviewController } from "../controllers/evaluation.controller";

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