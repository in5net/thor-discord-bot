-- AlterTable
ALTER TABLE "y7_images" ADD COLUMN     "file_name_search" tsvector
    GENERATED ALWAYS AS
    (to_tsvector('simple', file_name))
    STORED;

-- CreateIndex
CREATE INDEX "y7_images_file_name_search_idx" ON "y7_images" USING GIN ("file_name_search");
