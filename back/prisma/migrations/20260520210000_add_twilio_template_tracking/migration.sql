ALTER TABLE `media_requests`
  ADD COLUMN `twilio_template_message_sid` VARCHAR(64) NULL,
  ADD COLUMN `twilio_template_message_status` VARCHAR(32) NULL,
  ADD COLUMN `twilio_template_error_code` VARCHAR(32) NULL,
  ADD COLUMN `twilio_template_error_message` TEXT NULL;

CREATE INDEX `media_requests_twilio_template_message_sid_idx`
  ON `media_requests`(`twilio_template_message_sid`);
