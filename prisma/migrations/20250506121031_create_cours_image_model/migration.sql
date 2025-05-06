/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Cours` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CoursImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "coursId" INTEGER NOT NULL,
    CONSTRAINT "CoursImage_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "folderId" INTEGER,
    CONSTRAINT "Cours_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Cours" ("folderId", "id", "title", "url") SELECT "folderId", "id", "title", "url" FROM "Cours";
DROP TABLE "Cours";
ALTER TABLE "new_Cours" RENAME TO "Cours";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CoursImage_coursId_key" ON "CoursImage"("coursId");
