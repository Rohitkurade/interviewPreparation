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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get("/interviews", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const analyticsResponse = await api.get("/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setInterviews(response.data.interviews);
        setAnalytics(analyticsResponse.data);
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

  const strongestSkill =
  analytics?.skillPerformance?.length > 0
    ? [...analytics.skillPerformance].sort(
        (a: any, b: any) => b.score - a.score
      )[0]
    : null;

const weakestSkill =
  analytics?.skillPerformance?.length > 0
    ? [...analytics.skillPerformance].sort(
        (a: any, b: any) => a.score - b.score
      )[0]
    : null;

const latestScore =
  analytics?.scoreHistory?.length > 0
    ? analytics.scoreHistory[analytics.scoreHistory.length - 1].score
    : null;

const previousScore =
  analytics?.scoreHistory?.length > 1
    ? analytics.scoreHistory[analytics.scoreHistory.length - 2].score
    : null;

const scoreChange =
  latestScore !== null && previousScore !== null
    ? Number((latestScore - previousScore).toFixed(1))
    : null;

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

          {/* Performance Analytics */}

{analytics && analytics.scoreHistory.length > 0 && (
  <Box className="analytics-section">
    <Box sx={{ mb: 2 }}>
      <Typography className="eyebrow">
        Performance analytics
      </Typography>

      <Typography component="h2" className="section-title">
        Score progress
      </Typography>

      <Typography className="page-subtitle">
        Track how your interview performance changes over time.
      </Typography>
    </Box>

    <Card className="analytics-chart-card">
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={analytics.scoreHistory.map((item: any, index: number) => ({
              interview: `Interview ${index + 1}`,
              score: item.score,
            }))}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="interview" />

            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--teal)"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </Box>
)}
               {/* Skill Performance */}

{analytics && analytics.skillPerformance.length > 0 && (
  <Box className="skill-performance-section">
    <Box sx={{ mb: 2 }}>
      <Typography className="eyebrow">
        Skill analysis
      </Typography>

      <Typography component="h2" className="section-title">
        Skill performance
      </Typography>

      <Typography className="page-subtitle">
        See which technical areas are strong and where you can improve.
      </Typography>
    </Box>

    <Card className="skill-performance-card">
      <CardContent>
        {analytics.skillPerformance.map((skill: any) => (
          <Box key={skill.skill} className="analytics-skill-row">
            <Box className="analytics-skill-header">
              <Typography className="analytics-skill-name">
                {skill.skill}
              </Typography>

              <Typography className="analytics-skill-score">
                {skill.score}/10
              </Typography>
            </Box>

            <Box className="analytics-skill-track">
              <Box
                className="analytics-skill-fill"
                sx={{
                  width: `${skill.score * 10}%`,
                }}
              />
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  </Box>
)}     

        {/* AI Performance Insights */}

{analytics && analytics.skillPerformance.length > 0 && (
  <Box className="insights-section">
    <Box sx={{ mb: 2 }}>
      <Typography className="eyebrow">
        Performance insights
      </Typography>

      <Typography component="h2" className="section-title">
        What your results say
      </Typography>

      <Typography className="page-subtitle">
        A quick summary of your current interview performance.
      </Typography>
    </Box>

    <Box className="insights-grid">
      <Card className="insight-card">
        <CardContent>
          <Typography className="insight-icon">★</Typography>

          <Typography className="insight-label">
            Strongest skill
          </Typography>

          <Typography className="insight-value">
            {strongestSkill?.skill}
          </Typography>

          <Typography className="insight-description">
            You're currently strongest in this area with a score of{" "}
            {strongestSkill?.score}/10.
          </Typography>
        </CardContent>
      </Card>

      <Card className="insight-card">
        <CardContent>
          <Typography className="insight-icon">!</Typography>

          <Typography className="insight-label">
            Needs improvement
          </Typography>

          <Typography className="insight-value">
            {weakestSkill?.skill}
          </Typography>

          <Typography className="insight-description">
            Focus on this area to improve your overall interview
            performance.
          </Typography>
        </CardContent>
      </Card>

      <Card className="insight-card">
        <CardContent>
          <Typography className="insight-icon">↗</Typography>

          <Typography className="insight-label">
            Latest performance
          </Typography>

          <Typography className="insight-value">
            {latestScore}/10
          </Typography>

          <Typography className="insight-description">
            {scoreChange !== null
              ? scoreChange > 0
                ? `Up ${scoreChange} points from your previous interview.`
                : scoreChange < 0
                ? `Down ${Math.abs(scoreChange)} points from your previous interview.`
                : "Same score as your previous interview."
              : "Complete more interviews to track your progress."}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  </Box>
)}


        {/* Start Interview */}

        <Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
    mb: 5,
    flexWrap: "wrap",
  }}
>
  <Button
    variant="outlined"
    size="large"
    onClick={() => navigate("/study-plan")}
  >
    View study plan
  </Button>

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