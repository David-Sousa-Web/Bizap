-- AlterTable
ALTER TABLE `projects` ADD COLUMN `zabbix_host_name` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `zabbix_metric_events` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('TEMPLATE_SENT', 'YES_REPLY', 'INVALID_REPLY', 'MEDIA_SENT') NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `media_request_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `zabbix_metric_events_project_id_type_idx`(`project_id`, `type`),
    INDEX `zabbix_metric_events_media_request_id_idx`(`media_request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `zabbix_metric_events` ADD CONSTRAINT `zabbix_metric_events_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `zabbix_metric_events` ADD CONSTRAINT `zabbix_metric_events_media_request_id_fkey` FOREIGN KEY (`media_request_id`) REFERENCES `media_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
