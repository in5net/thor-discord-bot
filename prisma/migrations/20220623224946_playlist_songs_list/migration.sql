/*
  Warnings:

  - The `songs` column on the `playlists` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "songs",
ADD COLUMN     "songs" JSONB[];

-- DropEnum
DROP TYPE "SongType";
