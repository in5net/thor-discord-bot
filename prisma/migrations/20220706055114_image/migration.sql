-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "images_file_name_key" ON "images"("file_name");
