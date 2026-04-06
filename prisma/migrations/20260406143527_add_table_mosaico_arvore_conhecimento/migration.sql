-- CreateTable
CREATE TABLE "KnowledgeNode" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "libraryItemId" TEXT,
    "classId" TEXT,
    "period" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MosaicNode" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "weight" INTEGER,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MosaicNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BnccProgress" (
    "id" TEXT NOT NULL,
    "skillCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not-started',
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BnccProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeNode_type_idx" ON "KnowledgeNode"("type");

-- CreateIndex
CREATE INDEX "KnowledgeNode_classId_idx" ON "KnowledgeNode"("classId");

-- CreateIndex
CREATE INDEX "KnowledgeNode_parentId_idx" ON "KnowledgeNode"("parentId");

-- CreateIndex
CREATE INDEX "MosaicNode_parentId_idx" ON "MosaicNode"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "BnccProgress_skillCode_key" ON "BnccProgress"("skillCode");

-- AddForeignKey
ALTER TABLE "KnowledgeNode" ADD CONSTRAINT "KnowledgeNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MosaicNode" ADD CONSTRAINT "MosaicNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MosaicNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
