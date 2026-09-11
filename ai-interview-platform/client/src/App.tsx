import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateInterview from "./pages/CreateInterview";
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import StudyPlan from "./pages/StudyPlan";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("theme");
    return savedMode === "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setDarkMode((currentMode) => !currentMode)}
    >
      <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
      {darkMode ? "Light mode" : "Dark mode"}
    </button>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/create-interview"
          element={<CreateInterview />}
        />

        <Route
          path="/interview/:id"
          element={<Interview />}
        />

        <Route
          path="/results/:id"
          element={<Results />}
        />

        <Route path="/study-plan" element={<StudyPlan />} />


        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;