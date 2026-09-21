import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadResumeController } from "../controllers/resume.controller";
import { analyzeResumeController } from "../controllers/resumeAnalysis.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
},
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResumeController
);
router.post(
  "/:id/analyze",
  authMiddleware,
  analyzeResumeController
);

export default router;