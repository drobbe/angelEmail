-- AlterTable
ALTER TABLE `campaign` MODIFY `status` ENUM('CARGADA', 'PAUSADO', 'PROCESANDO', 'COMPLETADO', 'ELIMINADO', 'ERROR') NOT NULL DEFAULT 'CARGADA';
