-- CreateTable
CREATE TABLE "SkillScore" (
    "id" SERIAL NOT NULL,
    "skill" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "evaluationId" INTEGER NOT NULL,

    CONSTRAINT "SkillScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillScore_evaluationId_idx" ON "SkillScore"("evaluationId");

-- AddForeignKey
ALTER TABLE "SkillScore" ADD CONSTRAINT "SkillScore_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
