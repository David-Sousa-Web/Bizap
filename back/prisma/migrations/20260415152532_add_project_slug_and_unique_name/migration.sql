/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `projects` ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `projects_name_key` ON `projects`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `projects_slug_key` ON `projects`(`slug`);
