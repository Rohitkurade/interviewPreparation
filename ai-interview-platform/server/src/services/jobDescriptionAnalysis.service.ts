import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const analyzeJobDescription = async (
  jobDescriptionText: string
) => {
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",

    response_format: {
      type: "json_object",
    },

    max_tokens: 2000,

    messages: [
      {
        role: "system",
        content:
          "You are an expert technical recruiter and job description analyst. Analyze job descriptions objectively and return valid JSON only.",
      },
      {
        role: "user",
        content: `
Analyze the following job description.

JOB DESCRIPTION:
${jobDescriptionText}

Extract the important requirements from the job description.

Return exactly this JSON structure:

{
  "requiredSkills": ["string"],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "responsibilities": ["string"],
  "experienceRequirements": ["string"],
  "keyRequirements": ["string"]
}

Rules:
- Use only information present in the job description.
- Do not invent requirements.
- Avoid duplicate skills.
- Keep responsibilities concise.
- Keep each requirement concise.
- Focus on skills and requirements relevant to the role.
- Return valid JSON only.
`,
      },
    ],

    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty job description analysis");
  }

  return content;
};