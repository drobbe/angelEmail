/*
  Warnings:

  - Added the required column `base64Image` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `template` ADD COLUMN `base64Image` VARCHAR(191) NOT NULL;
