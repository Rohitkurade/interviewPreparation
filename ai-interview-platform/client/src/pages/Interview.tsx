import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Question {
  id: number;
  question: string;
  order: number;
  answer: {
    response: string;
  } | null;
}

const Interview = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savingQuestion, setSavingQuestion] = useState<number | null>(null);
  const [savedQuestion, setSavedQuestion] = useState<number | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const loadInterview = async () => {
    try {
      const response = await api.get(`/interviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const loadedQuestions = response.data.interview.questions;

setQuestions(loadedQuestions);

const initialAnswers: Record<number, string> = {};

loadedQuestions.forEach((question: Question) => {
  initialAnswers[question.id] =
    question.answer?.response || "";
});

setAnswers(initialAnswers);
    } catch (error) {
      console.error(error);
      setError("Failed to load interview.");
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    try {
      setGenerating(true);
      setError("");

      const response = await api.post(
        `/interviews/${id}/generate-questions`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuestions(response.data.questions);
    } catch (error) {
      console.error(error);
      setError("Failed to generate questions.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadInterview();
  }, [id]);

  if (loading) {
    return (
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
    );
  }

  const handleAnswerChange = (
  questionId: number,
  value: string
) => {
  setAnswers((previous) => ({
    ...previous,
    [questionId]: value,
  }));
};
const saveAnswer = async (questionId: number) => {
  try {
    setSavingQuestion(questionId);

    await api.post(
      `/interviews/questions/${questionId}/answer`,
      {
        response: answers[questionId] || "",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSavedQuestion(questionId);

setTimeout(() => {
  setSavedQuestion(null);
}, 2000);
  } catch (error) {
    console.error(error);
    alert("Failed to save answer.");
  } finally {
    setSavingQuestion(null);
  }
};

const handleSubmitInterview = async () => {
  try {
    setEvaluating(true);
    setError("");

    await api.post(
      `/interviews/${id}/evaluate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    window.location.href = `/results/${id}`;
  } catch (error) {
    console.error(error);
    setError("Failed to evaluate interview.");
  } finally {
    setEvaluating(false);
  }
};

  return (
    <Container maxWidth="md" className="page-shell interview-shell">
      <Typography className="eyebrow">Live practice session</Typography>
      <Typography className="page-title">Think out loud.</Typography>
      <Typography className="page-subtitle" sx={{ mb: 4 }}>Answer each question as if you were in the room. Save your response when it feels ready.</Typography>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {questions.length === 0 ? (
        <Box className="surface surface-pad">
          <Typography variant="h6" sx={{ mb: 2 }}>
            No questions generated yet.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={generateQuestions}
            disabled={generating}
          >
            {generating
              ? "Generating AI Questions..."
              : "Generate AI Questions"}
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {questions.map((question) => (
        <Card key={question.id} className="question-card">
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 12, mb: 2 }}>
            <span className="question-number">{question.order}</span>
            <Typography variant="h6">Question {question.order}</Typography>
          </Box>

          <Typography sx={{ mb: 2 }}>
            {question.question}
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Your Answer"
            placeholder="Type your answer here..."
            value={answers[question.id] || ""}
            onChange={(e) =>
              handleAnswerChange(
                question.id,
                e.target.value
              )
            }
          />

          <Box className="answer-actions">
          <Button
            variant="outlined"
            disabled={savingQuestion === question.id}
            onClick={() => saveAnswer(question.id)}
          >
            {savingQuestion === question.id
              ? "Saving..."
              : "Save answer"}
          </Button>

          {savedQuestion === question.id && (
            <Typography className="saved-message">Answer saved</Typography>
          )}
          </Box>
        </CardContent>
      </Card>
    ))}

    {/* SUBMIT INTERVIEW BUTTON */}
    <Box className="submit-panel">
      <Typography component="p">Ready to see how you performed?</Typography>
      <Button
        variant="contained"
        size="large"
        color="success"
        onClick={handleSubmitInterview}
        disabled={evaluating}
      >
        {evaluating
          ? "AI is evaluating your interview..."
          : "Submit interview"}
      </Button>
    </Box>
  </Box>
)}
    </Container>
  );
};

export default Interview;