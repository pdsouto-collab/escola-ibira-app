-- CreateTable
CREATE TABLE "ClassBoardPost" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "categoryType" TEXT NOT NULL,
    "linkedProjectId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "extraMaterials" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassBoardPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassBoardPostInteraction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassBoardPostInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassBoardPost_classId_idx" ON "ClassBoardPost"("classId");

-- CreateIndex
CREATE INDEX "ClassBoardPostInteraction_postId_idx" ON "ClassBoardPostInteraction"("postId");

-- AddForeignKey
ALTER TABLE "ClassBoardPostInteraction" ADD CONSTRAINT "ClassBoardPostInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ClassBoardPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
