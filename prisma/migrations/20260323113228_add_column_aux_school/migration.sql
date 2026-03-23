-- AlterTable
ALTER TABLE "SchoolClass" ADD COLUMN     "assistantId" TEXT;

-- CreateIndex
CREATE INDEX "SchoolClass_assistantId_idx" ON "SchoolClass"("assistantId");
