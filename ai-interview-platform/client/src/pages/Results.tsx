import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface SkillScore {
  id: number;
  skill: string;
  score: number;
}

interface Evaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  skillScores: SkillScore[];
}

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get(`/interviews/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEvaluation(response.data.interview.evaluation);
      } catch (error) {
        console.error(error);
        setError("Failed to load interview results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, token]);

  if (loading) {
    return (
      <Container>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !evaluation) {
    return (
      <Container>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography color="error">
            {error || "Evaluation not found."}
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 5 }}>
        <Typography
  variant="h3"
  gutterBottom
  sx={{ textAlign: "center" }}
>
  Interview Results 🎯
</Typography>

        <Typography
  variant="h6"
  color="text.secondary"
  sx={{
    mb: 4,
    textAlign: "center",
  }}
>
  AI-powered interview evaluation
</Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Overall Score
            </Typography>

            <Typography variant="h2" color="primary">
              {evaluation.overallScore}/10
            </Typography>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 3,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6">
                Technical Score
              </Typography>

              <Typography variant="h3" color="primary">
                {evaluation.technicalScore}/10
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">
                Communication Score
              </Typography>

              <Typography variant="h3" color="primary">
                {evaluation.communicationScore}/10
              </Typography>
            </CardContent>
          </Card>
        </Box>

          <Card sx={{ mb: 3 }}>
  <CardContent>
    <Typography variant="h5" gutterBottom>
      📊 Skill-wise Performance
    </Typography>

    {evaluation.skillScores.map((skill) => (
      <Box key={skill.id} sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <Typography>
            {skill.skill}
          </Typography>

          <Typography sx={{ fontWeight: "bold" }}>
  {skill.score}/10
</Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            height: 10,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${skill.score * 10}%`,
              height: "100%",
              backgroundColor: "primary.main",
            }}
          />
        </Box>
      </Box>
    ))}
  </CardContent>
</Card>


        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              💪 Strengths
            </Typography>

            <Typography>
              {evaluation.strengths}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              ⚠️ Weaknesses
            </Typography>

            <Typography>
              {evaluation.weaknesses}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              🚀 Suggestions
            </Typography>

            <Typography>
              {evaluation.suggestions}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: "center" }}>
  <Button
    variant="contained"
    size="large"
    onClick={() => navigate("/dashboard")}
  >
    Back to Dashboard
  </Button>
</Box>
      </Box>
    </Container>
  );
};

export default Results;