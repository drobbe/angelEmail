/*
  Warnings:

  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `profile` DROP FOREIGN KEY `Profile_userId_fkey`;

-- AlterTable
ALTER TABLE `dataemail` ADD COLUMN `error` TINYINT NULL DEFAULT 0,
    ADD COLUMN `errorMessage` TEXT NULL,
    ADD COLUMN `isSent` TINYINT NULL DEFAULT 0,
    ADD COLUMN `sentId` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `post`;

-- DropTable
DROP TABLE `profile`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `Jobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idServer` INTEGER NULL,
    `idCampaign` INTEGER NULL,
    `start` INTEGER NULL,
    `end` INTEGER NULL,
    `isRunning` TINYINT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `campaign`(`idCampaign`),
    INDEX `server`(`idServer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Servers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `host` VARCHAR(255) NOT NULL,
    `config` LONGTEXT NOT NULL,
    `sender` LONGTEXT NOT NULL,
    `active` TINYINT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servidores_emails` (
    `puerto_smtp` VARCHAR(255) NULL,
    `servidor_correo` VARCHAR(255) NULL,
    `Mail` VARCHAR(255) NULL,
    `Pass` VARCHAR(255) NULL,
    `accesos_web` VARCHAR(255) NULL,
    `administracion_Zimbra` VARCHAR(255) NULL,
    `admin_usuario` VARCHAR(255) NULL,
    `admin_pass` VARCHAR(255) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Jobs` ADD CONSTRAINT `campaign_fk` FOREIGN KEY (`idCampaign`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
