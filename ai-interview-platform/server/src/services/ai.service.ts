import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const generateInterviewQuestions = async (
  role: string,
  level: string,
  totalQuestions: number,
  personalizedContext?: {
    resumeAnalysis: unknown;
    jobDescriptionAnalysis: unknown;
    matchResult: unknown;
  }
) => {
  const personalization = personalizedContext
    ? `
PERSONALIZATION CONTEXT

RESUME ANALYSIS:
${JSON.stringify(personalizedContext.resumeAnalysis)}

JOB DESCRIPTION ANALYSIS:
${JSON.stringify(personalizedContext.jobDescriptionAnalysis)}

RESUME-JOB MATCH RESULT:
${JSON.stringify(personalizedContext.matchResult)}
`
    : "";

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",

    response_format: {
      type: "json_object",
    },

    max_completion_tokens: 4096,

    temperature: 0.7,

    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer who creates high-quality, personalized interview questions.",
      },
      {
        role: "user",
        content: `
Generate ${totalQuestions} interview questions for:

Job Role: ${role}
Experience Level: ${level}

${personalization}

Requirements:

- Questions must be relevant to the selected role.
- Match the difficulty to the experience level.
- Cover practical and conceptual knowledge.
- Avoid duplicate questions.
- If personalization context is provided, prioritize important skills from the job description.
- Test skills that are supported by the candidate's resume.
- Include questions related to missing or weaker job requirements when appropriate.
- Use the candidate's projects, technologies, and experience when creating realistic questions.
- Do not ask about technologies that have no evidence in the provided resume unless they are explicitly required by the job description.
- Questions should feel like a real technical interview.
- Return exactly ${totalQuestions} questions.

Return ONLY valid JSON using this structure:

{
  "questions": [
    {
      "question": "string"
    }
  ]
}

Do not include markdown.
Do not include explanations outside the JSON.
`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response");
  }

  return content;
};