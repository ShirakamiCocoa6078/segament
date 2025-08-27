/*
  Warnings:

  - You are about to drop the column `character` on the `GameProfile` table. All the data in the column will be lost.
  - You are about to drop the column `firstPlayDate` on the `GameProfile` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `GameProfile` table. All the data in the column will be lost.
  - You are about to drop the `GamePlaylog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameRatingLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."GamePlaylog" DROP CONSTRAINT "GamePlaylog_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameRatingLog" DROP CONSTRAINT "GameRatingLog_profileId_fkey";

-- AlterTable
ALTER TABLE "public"."GameProfile" DROP COLUMN "character",
DROP COLUMN "firstPlayDate",
DROP COLUMN "title",
ADD COLUMN     "battleRankImg" TEXT,
ADD COLUMN     "characterBackground" TEXT,
ADD COLUMN     "characterImage" TEXT,
ADD COLUMN     "classEmblemBase" TEXT,
ADD COLUMN     "classEmblemTop" TEXT,
ADD COLUMN     "friendCode" TEXT,
ADD COLUMN     "honors" JSONB,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastPlayDate" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nameplateImage" TEXT,
ADD COLUMN     "ratingHistory" JSONB,
ADD COLUMN     "teamEmblemColor" TEXT,
ADD COLUMN     "teamName" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "username" TEXT;

-- DropTable
DROP TABLE "public"."GamePlaylog";

-- DropTable
DROP TABLE "public"."GameRatingLog";

-- CreateTable
CREATE TABLE "public"."GameData" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "playlogs" JSONB,
    "ratingLists" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameData_profileId_key" ON "public"."GameData"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."GameData" ADD CONSTRAINT "GameData_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."GameProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
