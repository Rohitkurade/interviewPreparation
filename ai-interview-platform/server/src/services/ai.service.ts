import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const generateInterviewQuestions = async (
  role: string,
  level: string,
  totalQuestions: number
) => {
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer who creates high-quality interview questions.",
      },
      {
        role: "user",
        content: `
Generate ${totalQuestions} interview questions for:

Job Role: ${role}
Experience Level: ${level}

Requirements:
- Questions must be relevant to the selected role.
- Match the difficulty to the experience level.
- Cover practical and conceptual knowledge.
- Avoid duplicate questions.
- Return ONLY a JSON array.
- Each item must contain exactly:
  "question": string

Example:
[
  {
    "question": "What is the difference between let, const and var in JavaScript?"
  }
]

Do not include markdown.
Do not include explanations outside the JSON.
`,
      },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response");
  }

  return content;
};