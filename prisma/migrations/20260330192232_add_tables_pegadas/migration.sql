-- CreateTable
CREATE TABLE "PegadaPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaUrls" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PegadaPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PegadaInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pegadaPostId" TEXT NOT NULL,

    CONSTRAINT "PegadaInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PegadaInteraction_pegadaPostId_idx" ON "PegadaInteraction"("pegadaPostId");

-- AddForeignKey
ALTER TABLE "PegadaInteraction" ADD CONSTRAINT "PegadaInteraction_pegadaPostId_fkey" FOREIGN KEY ("pegadaPostId") REFERENCES "PegadaPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
