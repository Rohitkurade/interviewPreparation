import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

interface SkillPerformance {
  skill: string;
  score: number;
}

export const generateStudyPlan = async (
  skills: SkillPerformance[]
) => {
  const sortedSkills = [...skills]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",

    response_format: {
      type: "json_object",
    },

    max_tokens: 1200,

    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interview preparation coach. Return valid JSON only.",
      },
      {
        role: "user",
        content: `
Create a concise personalized technical interview study plan.

Weakest skills:
${JSON.stringify(sortedSkills)}

Return recommendations for the 3 most important skills.

For each skill include:
- skill
- score
- priority: High, Medium, or Low
- exactly 2 topics
- exactly 2 practical exercises

Do not recommend skills with a score of 8 or higher unless necessary.

Return this exact JSON structure:

{
  "recommendations": [
    {
      "skill": "string",
      "score": 0,
      "priority": "High",
      "topics": ["string", "string"],
      "exercises": ["string", "string"]
    }
  ]
}
`,
      },
    ],
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty study plan");
  }

  return content;
};