-- CreateTable
CREATE TABLE `Template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `htmlTemplate` VARCHAR(191) NOT NULL,
    `htmlJson` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Template_client_key`(`client`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
