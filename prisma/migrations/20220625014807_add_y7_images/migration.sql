-- CreateTable
CREATE TABLE "y7_images" (
    "id" BIGSERIAL NOT NULL,
    "file_name" TEXT NOT NULL,

    CONSTRAINT "y7_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "y7_images_file_name_key" ON "y7_images"("file_name");
