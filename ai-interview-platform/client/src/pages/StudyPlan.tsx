import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Recommendation {
  skill: string;
  score: number;
  priority: string;
  topics: string[];
  exercises: string[];
}

interface StudyPlanData {
  recommendations: Recommendation[];
}

const StudyPlan = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        const response = await api.get("/study-plan", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStudyPlan(response.data);
      } catch (error: any) {
        console.error("Failed to fetch study plan:", error);

        setError(
          error.response?.data?.message ||
            "Failed to generate study plan."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStudyPlan();
    }
  }, [token]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />

          <Typography color="text.secondary">
            Creating your personalized study plan...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6">
              Unable to generate study plan
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1, mb: 3 }}
            >
              {error}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="page-shell">
      <Box sx={{ mb: 5 }}>
        <Typography className="eyebrow">
          Personalized preparation
        </Typography>

        <Typography className="page-title">
          Your study plan
        </Typography>

        <Typography className="page-subtitle">
          Focus on the skills that will have the biggest impact
          on your interview performance.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {studyPlan?.recommendations.map((recommendation) => (
          <Card
            key={recommendation.skill}
            className="study-plan-card"
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography className="study-skill">
                    {recommendation.skill}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Current score: {recommendation.score}/10
                  </Typography>
                </Box>

                <Chip
                  label={recommendation.priority}
                  color={
                    recommendation.priority === "High"
                      ? "error"
                      : recommendation.priority === "Medium"
                      ? "warning"
                      : "success"
                  }
                  variant="outlined"
                />
              </Box>

              <Typography className="study-section-title">
                Topics to study
              </Typography>

              <Box
                component="ul"
                sx={{
                  mt: 1,
                  pl: 3,
                  mb: 3,
                }}
              >
                {recommendation.topics.map((topic) => (
                  <Typography
                    component="li"
                    key={topic}
                    className="study-item"
                  >
                    {topic}
                  </Typography>
                ))}
              </Box>

              <Typography className="study-section-title">
                Practical exercises
              </Typography>

              <Box
                component="ul"
                sx={{
                  mt: 1,
                  pl: 3,
                  mb: 0,
                }}
              >
                {recommendation.exercises.map((exercise) => (
                  <Typography
                    component="li"
                    key={exercise}
                    className="study-item"
                  >
                    {exercise}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default StudyPlan;