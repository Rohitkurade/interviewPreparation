import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import studyPlanRoutes from "./routes/studyPlan.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jobDescriptionRoutes from "./routes/jobDescription.routes.js";
import resumeMatchRoutes from "./routes/resumeMatch.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/interviews", interviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/job-descriptions", jobDescriptionRoutes);
app.use("/api/matches", resumeMatchRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      database: "connected",
      message: "AI Interview Platform API is running",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      database: "disconnected",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});