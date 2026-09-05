import { prisma } from "../lib/prisma";

export const submitAnswer = async (
  questionId: number,
  userId: number,
  response: string
) => {
  // Make sure the question belongs to an interview
  // owned by the logged-in user.
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      interview: {
        userId,
      },
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // Create or update the answer.
  const answer = await prisma.answer.upsert({
    where: {
      questionId,
    },
    update: {
      response,
    },
    create: {
      questionId,
      response,
    },
  });

  return answer;
};