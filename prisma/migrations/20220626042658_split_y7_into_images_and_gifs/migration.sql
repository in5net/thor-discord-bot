/*
  Warnings:

  - You are about to drop the column `frames` on the `y7_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "y7_images" DROP COLUMN "frames",
ADD COLUMN     "height" SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN     "size" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "width" SMALLINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "y7_gifs" (
    "id" BIGSERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "width" SMALLINT NOT NULL DEFAULT 0,
    "height" SMALLINT NOT NULL DEFAULT 0,
    "frames" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "y7_gifs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "y7_gifs_file_name_key" ON "y7_gifs"("file_name");
