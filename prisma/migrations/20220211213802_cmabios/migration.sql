/*
  Warnings:

  - Added the required column `urlPreview` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `template` ADD COLUMN `urlPreview` VARCHAR(191) NOT NULL,
    MODIFY `htmlTemplate` TEXT NOT NULL,
    MODIFY `htmlJson` TEXT NOT NULL;
