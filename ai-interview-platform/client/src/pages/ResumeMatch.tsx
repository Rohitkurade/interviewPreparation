import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  LinearProgress,
  Alert,
  TextField,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import api from "../services/api";

interface ResumeAnalysis {
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  projects: {
    name: string;
    technologies: string[];
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    duration: string;
  }[];
  leadership: {
    role: string;
    duration: string;
    description: string;
  }[];
  strengths: string[];
  improvements: string[];
}

interface JobDescriptionAnalysis {
  requiredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  responsibilities: string[];
  experienceRequirements: string[];
  keyRequirements: string[];
}

interface MatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  analysis: {
    summary: string;
    strengths: string[];
    gaps: string[];
  };
}


const ResumeMatch = () => {
  const [file, setFile] = useState<File | null>(null);

  const [resumeId, setResumeId] = useState<number | null>(null);

  const [analysis, setAnalysis] =
    useState<ResumeAnalysis | null>(null);

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [jobDescriptionId, setJobDescriptionId] =
  useState<number | null>(null);

  const [jobAnalysis, setJobAnalysis] =
  useState<JobDescriptionAnalysis | null>(null);

  const [savingJD, setSavingJD] = useState(false);
  const [analyzingJD, setAnalyzingJD] = useState(false);
  const [matchResult, setMatchResult] =
  useState<MatchResult | null>(null);

  const [matching, setMatching] = useState(false);




  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setAnalysis(null);
    setResumeId(null);

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please upload a PDF file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyzeResume = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setError("");
      setAnalysis(null);

      // -----------------------------
      // STEP 1: Upload Resume
      // -----------------------------

      setUploading(true);

      const formData = new FormData();

      formData.append("resume", file);

      const uploadResponse = await api.post(
        "/resume/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedResumeId =
        uploadResponse.data.resumeId;

      setResumeId(uploadedResumeId);

      setUploading(false);

      // -----------------------------
      // STEP 2: Analyze Resume
      // -----------------------------

      setAnalyzing(true);

      const analysisResponse = await api.post(
        `/resume/${uploadedResumeId}/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAnalysis(
        analysisResponse.data.analysis
      );

      setAnalyzing(false);
    } catch (err: any) {
      console.error("Resume analysis error:", err);

      setUploading(false);
      setAnalyzing(false);

      setError(
        err.response?.data?.message ||
          "Failed to upload or analyze resume."
      );
    }
  };

  const handleAnalyzeJobDescription = async () => {
  if (jobDescription.trim().length < 50) {
    setError(
      "Job description must contain at least 50 characters."
    );
    return;
  }

  try {
    setError("");
    setJobAnalysis(null);
    setJobDescriptionId(null);

    // -----------------------------
    // STEP 1: Save Job Description
    // -----------------------------

    setSavingJD(true);

    const response = await api.post(
      "/job-descriptions",
      {
        title: jobTitle,
        company,
        description: jobDescription,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const savedJobDescriptionId =
      response.data.jobDescription.id;

    setJobDescriptionId(savedJobDescriptionId);

    setSavingJD(false);

    // -----------------------------
    // STEP 2: Analyze Job Description
    // -----------------------------

    setAnalyzingJD(true);

    const analysisResponse = await api.post(
      `/job-descriptions/${savedJobDescriptionId}/analyze`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setJobAnalysis(
      analysisResponse.data.analysis
    );

    setAnalyzingJD(false);
  } catch (err: any) {
    console.error(
      "Job description analysis error:",
      err
    );

    setSavingJD(false);
    setAnalyzingJD(false);

    setError(
      err.response?.data?.message ||
        "Failed to save or analyze job description."
    );
  }
};

    const handleMatchResumeWithJob = async () => {
  if (!resumeId) {
    setError("Please analyze your resume first.");
    return;
  }

  if (!jobDescriptionId) {
    setError(
      "Please analyze the job description first."
    );
    return;
  }

  try {
    setError("");
    setMatchResult(null);
    setMatching(true);

    const response = await api.post(
      `/matches/resume/${resumeId}/job-description/${jobDescriptionId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setMatchResult(response.data.match);
  } catch (err: any) {
    console.error("Resume match error:", err);

    setError(
      err.response?.data?.message ||
        "Failed to match resume with job description."
    );
  } finally {
    setMatching(false);
  }
};


  const isProcessing = uploading || analyzing;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700 }}
          gutterBottom
        >
          Resume & Job Match
        </Typography>

        <Typography color="text.secondary">
          Upload your resume and use AI to analyze your
          skills and match them with a job description.
        </Typography>
      </Box>

      {/* Upload Card */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "primary.main",
              borderRadius: 3,
              p: 6,
              textAlign: "center",
              backgroundColor: "action.hover",
            }}
          >
            <UploadFileIcon
              sx={{
                fontSize: 55,
                color: "primary.main",
                mb: 2,
              }}
            />

            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              Upload your resume
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1, mb: 3 }}
            >
              PDF format only · Maximum size 5 MB
            </Typography>

            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={isProcessing}
            >
              Choose Resume

              <input
                type="file"
                hidden
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              sx={{ mt: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Selected File */}
          {file && !error && (
            <Box sx={{ mt: 3 }}>
              <Alert
                severity="success"
                icon={<DescriptionIcon />}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {file.name}
                </Typography>

                <Typography variant="body2">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Alert>

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
                onClick={handleAnalyzeResume}
                disabled={isProcessing}
              >
                {uploading
                  ? "Uploading Resume..."
                  : analyzing
                  ? "AI Analyzing Resume..."
                  : "Analyze Resume with AI"}
              </Button>
            </Box>
          )}

          {/* Processing */}
          {isProcessing && (
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {uploading
                  ? "Uploading your resume..."
                  : "AI is analyzing your resume..."}
              </Typography>

              <LinearProgress />
            </Box>
          )}

          {/* Success */}
          {analysis && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mt: 3 }}
            >
              Resume analyzed successfully.
              {resumeId && ` Resume ID: ${resumeId}`}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Preview */}
      {analysis && (
        <Card
          sx={{
            mt: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700 }}
              gutterBottom
            >
              AI Resume Analysis
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {analysis.summary}
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              Skills
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {analysis.skills.join(", ")}
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mt: 3 }}
            >
              Strengths
            </Typography>

            <Box component="ul" sx={{ mt: 1 }}>
              {analysis.strengths.map(
                (strength, index) => (
                  <li key={index}>
                    <Typography>
                      {strength}
                    </Typography>
                  </li>
                )
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mt: 3 }}
            >
              Improvements
            </Typography>

            <Box component="ul" sx={{ mt: 1 }}>
              {analysis.improvements.map(
                (improvement, index) => (
                  <li key={index}>
                    <Typography>
                      {improvement}
                    </Typography>
                  </li>
                )
              )}
            </Box>
          </CardContent>
        </Card>
    )}
        {/* Job Description Section */}
        <Card
  sx={{
    mt: 4,
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
  }}
>
  <CardContent sx={{ p: 4 }}>
    <Typography
      variant="h5"
      sx={{ fontWeight: 700 }}
      gutterBottom
    >
      Job Description
    </Typography>

    <Typography
      color="text.secondary"
      sx={{ mb: 3 }}
    >
      Paste the job description you want to compare
      against your resume.
    </Typography>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
        },
        gap: 2,
        mb: 2,
      }}
    >
      <TextField
        label="Job Title"
        placeholder="e.g. Frontend Developer"
        value={jobTitle}
        onChange={(e) =>
          setJobTitle(e.target.value)
        }
        fullWidth
      />

      <TextField
        label="Company"
        placeholder="e.g. Google"
        value={company}
        onChange={(e) =>
          setCompany(e.target.value)
        }
        fullWidth
      />
    </Box>

    <TextField
      label="Job Description"
      placeholder="Paste the complete job description here..."
      value={jobDescription}
      onChange={(e) =>
        setJobDescription(e.target.value)
      }
      fullWidth
      multiline
      minRows={8}
    />

    <Button
      fullWidth
      variant="contained"
      size="large"
      sx={{ mt: 2 }}
      onClick={handleAnalyzeJobDescription}
      disabled={
        savingJD ||
        analyzingJD ||
        jobDescription.trim().length < 50
      }
    >
      {savingJD
        ? "Saving Job Description..."
        : analyzingJD
        ? "AI Analyzing Job Description..."
        : "Analyze Job Description with AI"}
    </Button>

    {(savingJD || analyzingJD) && (
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {savingJD
            ? "Saving job description..."
            : "AI is analyzing the job description..."}
        </Typography>

        <LinearProgress />
      </Box>
    )}

    {jobAnalysis && (
      <Alert
        severity="success"
        icon={<CheckCircleIcon />}
        sx={{ mt: 3 }}
      >
        Job description analyzed successfully.
        {jobDescriptionId &&
          ` Job Description ID: ${jobDescriptionId}`}
      </Alert>
    )}
  </CardContent>
</Card>

{/* JD Analysis Preview */}
{jobAnalysis && (
  <Card
    sx={{
      mt: 4,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "none",
    }}
  >
    <CardContent sx={{ p: 4 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        AI Job Description Analysis
      </Typography>

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mt: 3 }}
      >
        Required Skills
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {jobAnalysis.requiredSkills.join(", ")}
      </Typography>

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mt: 3 }}
      >
        Technical Skills
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {jobAnalysis.technicalSkills.join(", ")}
      </Typography>

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mt: 3 }}
      >
        Soft Skills
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {jobAnalysis.softSkills.join(", ")}
      </Typography>

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mt: 3 }}
      >
        Responsibilities
      </Typography>

      <Box component="ul" sx={{ mt: 1 }}>
        {jobAnalysis.responsibilities.map(
          (responsibility, index) => (
            <li key={index}>
              <Typography>
                {responsibility}
              </Typography>
            </li>
          )
        )}
      </Box>
    </CardContent>
  </Card>
)}

{/* Resume ↔ Job Match */}
{resumeId && jobDescriptionId && (
  <Card
    sx={{
      mt: 4,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "none",
    }}
  >
    <CardContent sx={{ p: 4 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Resume ↔ Job Match
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Compare your resume against this job description
        using AI.
      </Typography>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleMatchResumeWithJob}
        disabled={matching}
      >
        {matching
          ? "AI Matching Resume..."
          : "Match Resume with Job"}
      </Button>

      {matching && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            AI is comparing your resume with the job
            requirements...
          </Typography>

          <LinearProgress />
        </Box>
      )}

      {matchResult && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mt: 3 }}
        >
          Resume and job description matched successfully.
        </Alert>
      )}
    </CardContent>
  </Card>)}

  {/* Match Dashboard */}
{matchResult && (
  <Box sx={{ mt: 4 }}>

    {/* Match Score */}
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700 }}
          gutterBottom
        >
          Resume Match Score
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          How closely your resume matches the job requirements
        </Typography>

        <Box
          sx={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `conic-gradient(
              #1976d2 ${matchResult.matchScore}%,
              rgba(128,128,128,0.2) ${matchResult.matchScore}% 100%
            )`,
          }}
        >
          <Box
            sx={{
              width: 145,
              height: 145,
              borderRadius: "50%",
              backgroundColor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "primary.main",
              }}
            >
              {matchResult.matchScore}%
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Match
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            mt: 3,
            fontWeight: 600,
          }}
        >
          {matchResult.analysis.summary}
        </Typography>
      </CardContent>
    </Card>

    {/* Matched + Missing Skills */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
        },
        gap: 3,
        mt: 3,
      }}
    >

      {/* Matched Skills */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
            gutterBottom
          >
            🟢 Matched Skills
          </Typography>

          {matchResult.matchedSkills.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 2,
              }}
            >
              {matchResult.matchedSkills.map(
                (skill, index) => (
                  <Box
                    key={index}
                    sx={{
                      px: 1.5,
                      py: 0.7,
                      borderRadius: 2,
                      backgroundColor:
                        "rgba(46, 125, 50, 0.12)",
                      color: "success.main",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                  </Box>
                )
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">
              No matched skills found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Missing Skills */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
            gutterBottom
          >
            🔴 Missing Skills
          </Typography>

          {matchResult.missingSkills.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 2,
              }}
            >
              {matchResult.missingSkills.map(
                (skill, index) => (
                  <Box
                    key={index}
                    sx={{
                      px: 1.5,
                      py: 0.7,
                      borderRadius: 2,
                      backgroundColor:
                        "rgba(211, 47, 47, 0.12)",
                      color: "error.main",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                  </Box>
                )
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">
              No missing skills. 🎉
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>

    {/* Additional Skills */}
    <Card
      sx={{
        mt: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
          gutterBottom
        >
          🔵 Additional Skills
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Relevant skills in your resume that are not
          explicitly required by this job description.
        </Typography>

        {matchResult.additionalSkills.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {matchResult.additionalSkills.map(
              (skill, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 1.5,
                    py: 0.7,
                    borderRadius: 2,
                    backgroundColor:
                      "rgba(25, 118, 210, 0.12)",
                    color: "primary.main",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  {skill}
                </Box>
              )
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">
            No additional skills identified.
          </Typography>
        )}
      </CardContent>
    </Card>

    {/* Strengths + Gaps */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
        },
        gap: 3,
        mt: 3,
      }}
    >

      {/* Strengths */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
            gutterBottom
          >
            💪 Strengths
          </Typography>

          <Box component="ul" sx={{ mt: 2, pl: 2.5 }}>
            {matchResult.analysis.strengths.map(
              (strength, index) => (
                <li key={index}>
                  <Typography sx={{ mb: 1 }}>
                    {strength}
                  </Typography>
                </li>
              )
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Gaps */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
            gutterBottom
          >
            ⚠️ Areas to Improve
          </Typography>

          <Box component="ul" sx={{ mt: 2, pl: 2.5 }}>
            {matchResult.analysis.gaps.map(
              (gap, index) => (
                <li key={index}>
                  <Typography sx={{ mb: 1 }}>
                    {gap}
                  </Typography>
                </li>
              )
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>

  </Box>
)}


    </Container>
  );
};

export default ResumeMatch;