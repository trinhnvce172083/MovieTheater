-- Migration: Add time_slot_type column to movietheater_schedule table
-- Version: V20241224001
-- Description: Thêm trường time_slot_type để lưu loại khung giờ chiếu (MORNING, AFTERNOON, EVENING, LATE_NIGHT)

-- Thêm cột time_slot_type
ALTER TABLE movietheater_schedule 
ADD COLUMN time_slot_type VARCHAR(20) NULL COMMENT 'Loại khung giờ chiếu: MORNING, AFTERNOON, EVENING, LATE_NIGHT';

-- Cập nhật dữ liệu hiện có dựa trên start_time
UPDATE movietheater_schedule 
SET time_slot_type = CASE 
    WHEN HOUR(start_time) >= 8 AND HOUR(start_time) < 12 THEN 'MORNING'
    WHEN HOUR(start_time) >= 12 AND HOUR(start_time) < 18 THEN 'AFTERNOON' 
    WHEN HOUR(start_time) >= 18 AND HOUR(start_time) < 22 THEN 'EVENING'
    ELSE 'LATE_NIGHT'
END
WHERE time_slot_type IS NULL;

-- Thêm index cho trường time_slot_type để tối ưu query
CREATE INDEX idx_schedule_time_slot_type ON movietheater_schedule(time_slot_type);

-- Thêm index composite cho show_date và time_slot_type
CREATE INDEX idx_schedule_date_time_slot ON movietheater_schedule(show_date, time_slot_type);

-- Thêm constraint để đảm bảo chỉ có các giá trị hợp lệ
ALTER TABLE movietheater_schedule 
ADD CONSTRAINT chk_time_slot_type 
CHECK (time_slot_type IN ('MORNING', 'AFTERNOON', 'EVENING', 'LATE_NIGHT')); 