-- CreateTable
CREATE TABLE `DataEmail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `indentity` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `customVariables` TINYTEXT NULL,
    `idCampaign` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DataEmail` ADD CONSTRAINT `DataEmail_idCampaign_fkey` FOREIGN KEY (`idCampaign`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
