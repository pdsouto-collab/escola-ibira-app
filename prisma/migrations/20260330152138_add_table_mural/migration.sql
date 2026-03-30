-- CreateTable
CREATE TABLE "MuralEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "author" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "image" TEXT,
    "classId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MuralEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuralComment" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muralEventId" TEXT NOT NULL,

    CONSTRAINT "MuralComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MuralEvent_classId_idx" ON "MuralEvent"("classId");

-- CreateIndex
CREATE INDEX "MuralComment_muralEventId_idx" ON "MuralComment"("muralEventId");

-- AddForeignKey
ALTER TABLE "MuralComment" ADD CONSTRAINT "MuralComment_muralEventId_fkey" FOREIGN KEY ("muralEventId") REFERENCES "MuralEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
