import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const generateResumeMatch = async (
  resumeAnalysis: unknown,
  jobDescriptionAnalysis: unknown
) => {
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",

    response_format: {
      type: "json_object",
    },

    max_tokens: 2500,

    temperature: 0.1,

    messages: [
      {
        role: "system",
        content:
          "You are a technical recruiter. Compare a resume with a job description. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `
Compare these two JSON documents.

RESUME:
${JSON.stringify(resumeAnalysis)}

JOB DESCRIPTION:
${JSON.stringify(jobDescriptionAnalysis)}

Return exactly this JSON object:

{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "additionalSkills": [],
  "analysis": {
    "summary": "",
    "strengths": [],
    "gaps": []
  }
}

Rules:
1. matchScore must be a number from 0 to 100.
2. matchedSkills are important JD requirements supported by ANY evidence in the resume.
3. Check the entire resume analysis, including skills, experience, projects, descriptions, strengths, and leadership/team experience.
4. missingSkills are important JD requirements with no clear evidence anywhere in the resume.
5. additionalSkills are relevant resume skills that are not required by the JD.
6. Do not invent skills or experience.
7. Treat equivalent terminology as a match when the resume clearly demonstrates the capability.
8. Team leadership or leading a team counts as evidence of team collaboration.
9. Keep strengths to at most 3 items.
10. Keep gaps to at most 3 items.
11. Keep all strings concise.
12. Return ONLY the JSON object. No markdown. No explanation outside JSON.
`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty match analysis");
  }

  return content;
};