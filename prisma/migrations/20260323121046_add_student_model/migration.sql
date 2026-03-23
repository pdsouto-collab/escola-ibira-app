-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "document" TEXT,
    "schoolStage" TEXT,
    "period" TEXT,
    "photo" TEXT,
    "classId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'presente',
    "age" INTEGER,
    "parentName" TEXT,
    "guardians" JSONB,
    "financialResponsible" JSONB,
    "health" JSONB,
    "emergencyContacts" JSONB,
    "documents" JSONB,
    "hospitalPreference" TEXT,
    "hospitalAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Student_classId_idx" ON "Student"("classId");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
