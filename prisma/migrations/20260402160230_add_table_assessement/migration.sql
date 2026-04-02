-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,
    "sessionId" TEXT,
    "routineId" TEXT,
    "knowledgeNodeId" TEXT,
    "period" TEXT,
    "scope" TEXT NOT NULL,
    "classId" TEXT,
    "studentId" TEXT,
    "rating" INTEGER,
    "observations" TEXT NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttachment" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "capturedAt" TEXT NOT NULL,

    CONSTRAINT "AssessmentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assessment_studentId_idx" ON "Assessment"("studentId");

-- CreateIndex
CREATE INDEX "Assessment_projectId_idx" ON "Assessment"("projectId");

-- CreateIndex
CREATE INDEX "Assessment_knowledgeNodeId_idx" ON "Assessment"("knowledgeNodeId");

-- CreateIndex
CREATE INDEX "AssessmentAttachment_assessmentId_idx" ON "AssessmentAttachment"("assessmentId");

-- AddForeignKey
ALTER TABLE "AssessmentAttachment" ADD CONSTRAINT "AssessmentAttachment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
