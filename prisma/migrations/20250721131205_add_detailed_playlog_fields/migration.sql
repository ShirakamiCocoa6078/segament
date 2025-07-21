-- AlterTable
ALTER TABLE "GamePlaylog" ADD COLUMN     "clearType" TEXT,
ADD COLUMN     "fullChainType" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isAllJusticeCritical" BOOLEAN NOT NULL DEFAULT false;
