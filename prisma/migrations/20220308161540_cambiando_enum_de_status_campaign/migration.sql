/*
  Warnings:

  - The values [TERMINADO] on the enum `Campaign_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `campaign` MODIFY `status` ENUM('CARGADA', 'PAUSADO', 'PROCESANDO', 'COMPLETADO', 'ELIMINADO', 'ERROR') NOT NULL DEFAULT 'PAUSADO';
