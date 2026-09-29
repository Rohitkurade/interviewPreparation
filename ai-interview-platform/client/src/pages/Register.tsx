import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box } from "@mui/material";
import api from "../services/api";


const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      // Register API currently returns user but not token,
      // so redirect to login after successful registration.
      if (response.status === 201) {
        navigate("/login");
      }
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
          <div className="brand-mark">
            <span className="brand-dot" /> Prepwise
          </div>

          <div>
            <span className="login-badge">AI-powered practice</span>

            <Typography component="h1">
              Start preparing with confidence.
            </Typography>

            <Typography component="p">
              Create your account and turn every interview session into
              useful progress.
            </Typography>
          </div>
        </div>

        <div className="login-form">
          <Typography component="h2">Create account</Typography>

          <Typography component="p">
            Join Prepwise and start your interview practice.
          </Typography>

          <Box component="form" onSubmit={handleRegister}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            {error && (
              <Typography className="error-message">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <Typography
              component="p"
              onClick={() => navigate("/login")}
              sx={{
                cursor: "pointer",
                textAlign: "center",
                marginTop: "12px",
              }}
            >
              Already have an account? Sign in
            </Typography>
          </Box>
        </div>
      </section>
    </main>
  );
};

export default Register;