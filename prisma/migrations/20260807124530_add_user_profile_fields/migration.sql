-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_id" VARCHAR(100),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "gender" "gender",
ADD COLUMN     "preferred_language" VARCHAR(20),
ADD COLUMN     "profile_completed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "first_name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_users_city" ON "users"("city");

-- CreateIndex
CREATE INDEX "idx_users_gender" ON "users"("gender");

-- CreateIndex
CREATE INDEX "idx_users_profile_completed" ON "users"("profile_completed");
