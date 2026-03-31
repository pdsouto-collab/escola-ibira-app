-- CreateTable
CREATE TABLE "ScheduleItem" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "endTime" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT,
    "classId" TEXT,
    "projectId" TEXT,
    "routineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleItem_classId_idx" ON "ScheduleItem"("classId");

-- CreateIndex
CREATE INDEX "ScheduleItem_projectId_idx" ON "ScheduleItem"("projectId");

-- CreateIndex
CREATE INDEX "ScheduleItem_routineId_idx" ON "ScheduleItem"("routineId");
