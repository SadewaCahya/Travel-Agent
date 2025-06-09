/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Pembayaran` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `Reward` ADD COLUMN `orderId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX `Reward_orderId_key` ON `Reward`(`orderId`);

-- AddForeignKey
ALTER TABLE `Reward` ADD CONSTRAINT `Reward_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
