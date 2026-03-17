-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT,
    "birthDate" TEXT,
    "address" TEXT,
    "hiringDate" TEXT,
    "education" TEXT,
    "specialization" TEXT[],
    "bio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedClassIds" TEXT[],
    "linkedStudentIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
