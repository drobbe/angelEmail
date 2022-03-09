-- AlterTable
ALTER TABLE `template` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable` BOOLEAN NOT NULL DEFAULT true;
