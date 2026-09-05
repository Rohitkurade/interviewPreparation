import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreateInterview = () => {
  const [role, setRole] = useState("FRONTEND");
  const [level, setLevel] = useState("INTERN");
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { token } = useAuth();

  const handleCreateInterview = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/interviews",
        {
          role,
          level,
          totalQuestions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const interviewId = response.data.interview.id;

      navigate(`/interview/${interviewId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <Typography variant="h4">
          Create New Interview
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>

          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="FRONTEND">
              Frontend Developer
            </MenuItem>

            <MenuItem value="BACKEND">
              Backend Developer
            </MenuItem>

            <MenuItem value="FULLSTACK">
              Full Stack Developer
            </MenuItem>

            <MenuItem value="JAVA">
              Java Developer
            </MenuItem>

            <MenuItem value="CPP">
              C++ Developer
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Experience Level</InputLabel>

          <Select
            value={level}
            label="Experience Level"
            onChange={(e) => setLevel(e.target.value)}
          >
            <MenuItem value="INTERN">
              Intern
            </MenuItem>

            <MenuItem value="FRESHER">
              Fresher
            </MenuItem>

            <MenuItem value="JUNIOR">
              Junior
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Number of Questions</InputLabel>

          <Select
            value={totalQuestions}
            label="Number of Questions"
            onChange={(e) =>
              setTotalQuestions(Number(e.target.value))
            }
          >
            <MenuItem value={5}>5 Questions</MenuItem>
            <MenuItem value={10}>10 Questions</MenuItem>
            <MenuItem value={15}>15 Questions</MenuItem>
            <MenuItem value={20}>20 Questions</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          size="large"
          disabled={loading}
          onClick={handleCreateInterview}
        >
          {loading
            ? "Creating Interview..."
            : "Start Interview"}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateInterview;