-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "matchResultId" INTEGER;

-- CreateIndex
CREATE INDEX "Interview_matchResultId_idx" ON "Interview"("matchResultId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_matchResultId_fkey" FOREIGN KEY ("matchResultId") REFERENCES "MatchResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
