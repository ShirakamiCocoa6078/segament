/*
  Warnings:

  - You are about to drop the `ChunithmPlaylog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChunithmProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChunithmRatingLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaimaiProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OngekiProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChunithmPlaylog" DROP CONSTRAINT "ChunithmPlaylog_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ChunithmProfile" DROP CONSTRAINT "ChunithmProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChunithmRatingLog" DROP CONSTRAINT "ChunithmRatingLog_profileId_fkey";

-- DropForeignKey
ALTER TABLE "MaimaiProfile" DROP CONSTRAINT "MaimaiProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "OngekiProfile" DROP CONSTRAINT "OngekiProfile_userId_fkey";

-- DropTable
DROP TABLE "ChunithmPlaylog";

-- DropTable
DROP TABLE "ChunithmProfile";

-- DropTable
DROP TABLE "ChunithmRatingLog";

-- DropTable
DROP TABLE "MaimaiProfile";

-- DropTable
DROP TABLE "OngekiProfile";

-- CreateTable
CREATE TABLE "GameProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overPower" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "title" TEXT,
    "character" TEXT,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "firstPlayDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlaylog" (
    "profileId" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" TEXT,
    "isAllJustice" BOOLEAN NOT NULL DEFAULT false,
    "isFullCombo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GamePlaylog_pkey" PRIMARY KEY ("profileId","musicId","difficulty")
);

-- CreateTable
CREATE TABLE "GameRatingLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRatingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameProfile_userId_gameType_region_key" ON "GameProfile"("userId", "gameType", "region");

-- CreateIndex
CREATE INDEX "GameRatingLog_profileId_idx" ON "GameRatingLog"("profileId");

-- AddForeignKey
ALTER TABLE "GameProfile" ADD CONSTRAINT "GameProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlaylog" ADD CONSTRAINT "GamePlaylog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "GameProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRatingLog" ADD CONSTRAINT "GameRatingLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "GameProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
