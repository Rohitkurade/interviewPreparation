import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const analyzeResume = async (resumeText: string) => {
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",

    response_format: {
      type: "json_object",
    },

    max_completion_tokens: 4096,
    temperature: 0.2,
    reasoning_effort: "low",

    messages: [
      {
        role: "system",
        content:
          "You are an expert technical recruiter and resume analyst. Analyze resumes objectively and return valid JSON only.",
      },
      {
        role: "user",
        content: `
Analyze the following resume.

RESUME:
${resumeText}

Extract and evaluate the resume.

Return exactly this JSON structure:

{
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "technologies": ["string"],
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "duration": "string"
    }
  ],
  "leadership": [
    {
      "role": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "strengths": ["string"],
  "improvements": ["string"]
}

Rules:
- Use only information present in the resume.
- Do not invent skills, experience, projects, education, leadership, or achievements.
- Extract ALL technical skills explicitly mentioned anywhere in the resume.
- Include technologies mentioned in Professional Experience, Projects, and Technical Skills.
- Include programming languages, frameworks, libraries, databases, APIs, cloud platforms, developer tools, DevOps tools, and AI/ML technologies.
- Do not omit a technology simply because it appears inside a project or experience description.
- Extract leadership, team, volunteer, and other responsibility experience explicitly mentioned in the resume.
- Preserve evidence of team leadership and collaboration because it may be relevant for job matching.
- Avoid duplicate skills.
- Keep the summary concise.
- Keep each experience and project description concise.
- Keep leadership descriptions concise.
- Keep strengths to 3 items.
- Keep improvements to 3 items.
- Give practical resume improvement suggestions.
- Return valid JSON only.
`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty resume analysis");
  }

  return content;
};