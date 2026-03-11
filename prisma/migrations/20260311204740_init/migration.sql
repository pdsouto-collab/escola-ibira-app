-- DropIndex
DROP INDEX "Bncc_code_key";

-- AlterTable
ALTER TABLE "Bncc" ALTER COLUMN "code" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Bncc_type_idx" ON "Bncc"("type");
