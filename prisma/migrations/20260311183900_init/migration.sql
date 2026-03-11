-- CreateTable
CREATE TABLE "Bncc" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isBNCC" BOOLEAN NOT NULL,
    "subGroup" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bncc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bncc_code_key" ON "Bncc"("code");

-- CreateIndex
CREATE INDEX "Bncc_grade_idx" ON "Bncc"("grade");

-- CreateIndex
CREATE INDEX "Bncc_subGroup_idx" ON "Bncc"("subGroup");
