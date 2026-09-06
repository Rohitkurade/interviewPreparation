import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Evaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
}

interface Interview {
  id: number;
  role: string;
  level: string;
  totalQuestions: number;
  createdAt: string;
  evaluation: Evaluation | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get("/interviews", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setInterviews(response.data.interviews);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInterviews();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const evaluatedInterviews = interviews.filter(
    (interview) => interview.evaluation !== null
  );

  const averageScore =
    evaluatedInterviews.length > 0
      ? (
          evaluatedInterviews.reduce(
            (sum, interview) =>
              sum + (interview.evaluation?.overallScore || 0),
            0
          ) / evaluatedInterviews.length
        ).toFixed(1)
      : "0.0";

  const bestScore =
    evaluatedInterviews.length > 0
      ? Math.max(
          ...evaluatedInterviews.map(
            (interview) =>
              interview.evaluation?.overallScore || 0
          )
        )
      : 0;

  const formatRole = (role: string) => {
    return role
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatLevel = (level: string) => {
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" className="page-shell">
      <Box>
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Box>
            <Typography className="eyebrow">Your practice workspace</Typography>
            <Typography className="page-title">Welcome, {user?.name}</Typography>
            <Typography className="page-subtitle">Track your progress and keep your interview skills moving forward.</Typography>
          </Box>

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {/* Statistics */}

        <Box className="dashboard-grid">
          <Card className="stat-card">
            <CardContent>
              <Typography className="stat-label">Total interviews</Typography>
              <Typography className="stat-value">{interviews.length}</Typography>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent>
              <Typography className="stat-label">Average score</Typography>
              <Typography className="stat-value">{averageScore}<small>/10</small></Typography>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent>
              <Typography className="stat-label">Best score</Typography>
              <Typography className="stat-value">{bestScore}<small>/10</small></Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Start Interview */}

        <Box sx={{ textAlign: "right", mb: 5 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/create-interview")}
          >
            + Start new interview
          </Button>
        </Box>

        {/* Interview History */}

        <div className="history-heading">
          <Typography component="h2">Interview history</Typography>
          <Typography className="stat-label">{interviews.length} sessions</Typography>
        </div>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : interviews.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 5 }}>
              <Typography variant="h6">
                No interviews yet
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Start your first AI interview to see your
                results here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {interviews.map((interview) => (
              <Card key={interview.id} className="history-card">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box>
                      <Typography variant="h6">
                        {formatRole(interview.role)}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {formatLevel(interview.level)} •{" "}
                        {interview.totalQuestions} Questions •{" "}
                        {formatDate(interview.createdAt)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {interview.evaluation ? (
                        <>
                          <Chip
                            className="status-chip"
                            label={`${interview.evaluation.overallScore}/10`}
                            color="primary"
                          />

                          <Button
                            variant="outlined"
                            onClick={() =>
                              navigate(
                                `/results/${interview.id}`
                              )
                            }
                          >
                            View Results
                          </Button>
                        </>
                      ) : (
                        <Chip
                          className="status-chip"
                          label="Not Evaluated"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;