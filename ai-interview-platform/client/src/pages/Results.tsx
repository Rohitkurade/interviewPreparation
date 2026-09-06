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
    <Container maxWidth="md" className="page-shell">
      <Box>
        <Typography className="eyebrow">Session debrief</Typography>
        <Typography className="page-title">Your interview results</Typography>
        <Typography className="page-subtitle" sx={{ mb: 4 }}>A focused readout of what went well and where your next practice session can go.</Typography>

        <Card className="score-hero">
          <CardContent>
            <Typography component="h2">Overall score</Typography>
            <Typography component="p">Your strongest signal across this session.</Typography>
          </CardContent>
          <span className="score-number">{evaluation.overallScore}<small>/10</small></span>
        </Card>

        <Box className="score-grid">
          <Card className="score-card">
            <CardContent>
              <Typography className="stat-label">Technical score</Typography>
              <strong>{evaluation.technicalScore}/10</strong>
            </CardContent>
          </Card>
          <Card className="score-card">
            <CardContent>
              <Typography className="stat-label">Communication score</Typography>
              <strong>{evaluation.communicationScore}/10</strong>
            </CardContent>
          </Card>
        </Box>

          <Card className="result-section">
  <CardContent>
    <Typography component="h3">Skill-wise performance</Typography>

    {evaluation.skillScores.map((skill) => (
      <Box key={skill.id} className="skill-row">
        <div className="skill-label"><span>{skill.skill}</span><span>{skill.score}/10</span></div>
        <div className="skill-track"><div className="skill-fill" style={{ width: `${skill.score * 10}%` }} /></div>
      </Box>
    ))}
  </CardContent>
</Card>


        <Card className="result-section">
          <CardContent>
            <Typography component="h3">Strengths</Typography>

            <Typography>
              {evaluation.strengths}
            </Typography>
          </CardContent>
        </Card>

        <Card className="result-section">
          <CardContent>
            <Typography component="h3">Weaknesses</Typography>

            <Typography>
              {evaluation.weaknesses}
            </Typography>
          </CardContent>
        </Card>

        <Card className="result-section">
          <CardContent>
            <Typography component="h3">Suggestions</Typography>

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