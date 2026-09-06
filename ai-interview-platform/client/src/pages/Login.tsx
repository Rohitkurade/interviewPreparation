import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box } from "@mui/material";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      login(token, user);

      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Unable to connect to the server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-layout">
        <div className="login-intro">
          <div className="brand-mark"><span className="brand-dot" /> Prepwise</div>
          <div>
            <span className="login-badge">AI-powered practice</span>
            <Typography component="h1">Build confidence before the interview.</Typography>
            <Typography component="p">Practice realistic questions, sharpen your answers, and turn every session into useful momentum.</Typography>
          </div>
        </div>
        <div className="login-form">
          <Typography component="h2">Welcome back</Typography>
          <Typography component="p">Sign in to continue your interview practice.</Typography>
          <Box component="form" onSubmit={handleLogin}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
            {error && <Typography className="error-message">{error}</Typography>}
            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {loading ? "Logging in..." : "Enter workspace"}
            </Button>
          </Box>
        </div>
      </section>
    </main>
  );
};

export default Login;