-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "period" TEXT,
    "type" TEXT,
    "summary" TEXT,
    "objectives" TEXT,
    "finalProduct" TEXT,
    "guidingQuestion" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[],
    "bnccSkillIds" TEXT[],
    "contentIds" TEXT[],
    "students" TEXT[],
    "classes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
