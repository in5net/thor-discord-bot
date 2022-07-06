-- CreateTable
CREATE TABLE "users" (
    "id" CHAR(18) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "counts" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "uid" CHAR(18) NOT NULL,
    "name" TEXT NOT NULL,
    "songs" JSONB[],

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratios" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,

    CONSTRAINT "ratios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifs" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "gifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "y7_images" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" SMALLINT NOT NULL,
    "height" SMALLINT NOT NULL,

    CONSTRAINT "y7_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "y7_gifs" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" SMALLINT NOT NULL,
    "height" SMALLINT NOT NULL,
    "frames" SMALLINT NOT NULL,

    CONSTRAINT "y7_gifs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "playlists_uid_name_key" ON "playlists"("uid", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ratios_text_key" ON "ratios"("text");

-- CreateIndex
CREATE UNIQUE INDEX "gifs_file_name_key" ON "gifs"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "y7_images_file_name_key" ON "y7_images"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "y7_gifs_file_name_key" ON "y7_gifs"("file_name");
