import "dotenv/config";
import OpenAI from "openai";
import { prisma } from "../lib/prisma";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const evaluateInterview = async (
  interviewId: number,
  userId: number
) => {
  // Get the interview and all questions + answers
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      userId,
    },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
        include: {
          answer: true,
        },
      },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  // Make sure every question has an answer
  const unansweredQuestions = interview.questions.filter(
    (question) => !question.answer
  );

  if (unansweredQuestions.length > 0) {
    throw new Error("All questions must be answered");
  }

  const interviewData = interview.questions.map((question) => ({
    question: question.question,
    answer: question.answer!.response,
  }));

  const response = await client.responses.create({
    model: "openai/gpt-oss-20b",
    input: `
You are an expert technical interview evaluator.

Evaluate the candidate's interview answers.

Interview Role: ${interview.role}
Experience Level: ${interview.level}

Interview Questions and Answers:

${JSON.stringify(interviewData, null, 2)}

Evaluate the candidate based on:

1. Technical knowledge
2. Correctness of answers
3. Understanding of concepts
4. Communication quality
5. Practical understanding

Return ONLY valid JSON using exactly this structure:

{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "strengths": "string",
  "weaknesses": "string",
  "suggestions": "string",
  "skillScores": [
    {
      "skill": "string",
      "score": number
    }
  ]
}

For skillScores:
- Identify the most relevant technical skills based on the interview questions.
- Include 4 to 6 skills.
- Each skill must have a score between 0 and 10.
- Do not duplicate skills.

All scores must be between 0 and 10.

Do not include markdown.
Do not include explanations outside the JSON.
`,
  });

  const aiResult = response.output_text;

  let evaluationData;

  try {
    evaluationData = JSON.parse(aiResult);
  } catch {
    throw new Error("AI returned invalid evaluation format");
  }

  // Save evaluation to PostgreSQL
  const evaluation = await prisma.evaluation.upsert({
  where: {
    interviewId,
  },

  update: {
    overallScore: evaluationData.overallScore,
    technicalScore: evaluationData.technicalScore,
    communicationScore: evaluationData.communicationScore,
    strengths: evaluationData.strengths,
    weaknesses: evaluationData.weaknesses,
    suggestions: evaluationData.suggestions,

    skillScores: {
      deleteMany: {},
      create: evaluationData.skillScores.map(
        (skill: { skill: string; score: number }) => ({
          skill: skill.skill,
          score: skill.score,
        })
      ),
    },
  },

  create: {
    interviewId,
    overallScore: evaluationData.overallScore,
    technicalScore: evaluationData.technicalScore,
    communicationScore: evaluationData.communicationScore,
    strengths: evaluationData.strengths,
    weaknesses: evaluationData.weaknesses,
    suggestions: evaluationData.suggestions,

    skillScores: {
      create: evaluationData.skillScores.map(
        (skill: { skill: string; score: number }) => ({
          skill: skill.skill,
          score: skill.score,
        })
      ),
    },
  },
});

  return evaluation;
};