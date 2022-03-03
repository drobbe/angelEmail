-- CreateTable
CREATE TABLE `Campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `schedule` BOOLEAN NOT NULL DEFAULT false,
    `date` DATETIME(3) NULL,
    `client` INTEGER NOT NULL,
    `idTemplate` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_idTemplate_fkey` FOREIGN KEY (`idTemplate`) REFERENCES `Template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
