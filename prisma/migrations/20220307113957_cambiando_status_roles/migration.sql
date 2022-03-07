/*
  Warnings:

  - You are about to drop the column `role` on the `campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `campaign` DROP COLUMN `role`,
    ADD COLUMN `status` ENUM('PAUSADO', 'PROCESANDO', 'TERMINADO', 'ELIMINADO', 'ERROR') NOT NULL DEFAULT 'PAUSADO';
