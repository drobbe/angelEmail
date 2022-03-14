/*
  Warnings:

  - You are about to drop the column `isRunning` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the `servidores_emails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `dataemail` DROP FOREIGN KEY `DataEmail_idCampaign_fkey`;

-- AlterTable
ALTER TABLE `campaign` ADD COLUMN `statusMessage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `dataemail` ADD COLUMN `isValid` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `sentDate` DATETIME(3) NULL,
    ADD COLUMN `serverSent` INTEGER NULL,
    MODIFY `error` BOOLEAN NULL DEFAULT false,
    MODIFY `isSent` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `jobs` DROP COLUMN `isRunning`,
    ADD COLUMN `status` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `servers` ADD COLUMN `busy` BOOLEAN NULL DEFAULT false,
    MODIFY `active` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `template` MODIFY `deleted` BOOLEAN NULL DEFAULT false,
    MODIFY `enable` BOOLEAN NULL DEFAULT true;

-- DropTable
DROP TABLE `servidores_emails`;

-- AddForeignKey
ALTER TABLE `dataEmail` ADD CONSTRAINT `DataEmail_idCampaign_fkey` FOREIGN KEY (`idCampaign`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
