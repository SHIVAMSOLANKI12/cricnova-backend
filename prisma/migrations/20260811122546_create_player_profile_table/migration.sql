-- CreateEnum
CREATE TYPE "playing_role" AS ENUM ('BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER');

-- CreateEnum
CREATE TYPE "batting_style" AS ENUM ('RIGHT_HAND', 'LEFT_HAND');

-- CreateEnum
CREATE TYPE "bowling_style" AS ENUM ('RIGHT_ARM_FAST', 'LEFT_ARM_FAST', 'RIGHT_ARM_MEDIUM', 'LEFT_ARM_MEDIUM', 'RIGHT_ARM_OFF_SPIN', 'LEFT_ARM_ORTHODOX', 'RIGHT_ARM_LEG_SPIN', 'LEFT_ARM_CHINAMAN', 'NONE');

-- CreateTable
CREATE TABLE "player_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(100),
    "playing_role" "playing_role",
    "batting_style" "batting_style",
    "bowling_style" "bowling_style",
    "bio" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "player_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_player_profiles_user_id" ON "player_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_player_profiles_playing_role" ON "player_profiles"("playing_role");

-- CreateIndex
CREATE INDEX "idx_player_profiles_batting_style" ON "player_profiles"("batting_style");

-- CreateIndex
CREATE INDEX "idx_player_profiles_bowling_style" ON "player_profiles"("bowling_style");

-- AddForeignKey
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
