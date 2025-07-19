-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ChunithmProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overPower" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "title" TEXT,
    "character" TEXT,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "firstPlayDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChunithmProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChunithmPlaylog" (
    "profileId" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" TEXT,
    "isAllJustice" BOOLEAN NOT NULL DEFAULT false,
    "isFullCombo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChunithmPlaylog_pkey" PRIMARY KEY ("profileId","musicId","difficulty")
);

-- CreateTable
CREATE TABLE "ChunithmRatingLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChunithmRatingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaimaiProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MaimaiProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OngekiProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OngekiProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ChunithmProfile_userId_key" ON "ChunithmProfile"("userId");

-- CreateIndex
CREATE INDEX "ChunithmRatingLog_profileId_idx" ON "ChunithmRatingLog"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "MaimaiProfile_userId_key" ON "MaimaiProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OngekiProfile_userId_key" ON "OngekiProfile"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChunithmProfile" ADD CONSTRAINT "ChunithmProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChunithmPlaylog" ADD CONSTRAINT "ChunithmPlaylog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ChunithmProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChunithmRatingLog" ADD CONSTRAINT "ChunithmRatingLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ChunithmProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaimaiProfile" ADD CONSTRAINT "MaimaiProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OngekiProfile" ADD CONSTRAINT "OngekiProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
