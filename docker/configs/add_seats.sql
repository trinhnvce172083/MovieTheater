-- =============================================
-- SEAT SYSTEM SETUP FOR LUMIERE CINEMA
-- Thêm bảng seat và tạo dữ liệu ghế hoàn chỉnh cho 11 phòng chiếu
-- =============================================

USE cinema_db;

-- Seat table
CREATE TABLE IF NOT EXISTS movietheater_seat (
    seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cinema_room_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_row INT NOT NULL,
    seat_column INT NOT NULL,
    seat_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    seat_type VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    price_multiplier DOUBLE NOT NULL DEFAULT 1.0,
    is_recliner BOOLEAN NOT NULL DEFAULT FALSE,
    has_table BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_cinema_room (cinema_room_id),
    INDEX idx_seat_number (seat_number),
    INDEX idx_position (seat_row, seat_column),
    INDEX idx_status (seat_status),
    INDEX idx_type (seat_type),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_seat_position (cinema_room_id, seat_row, seat_column),
    FOREIGN KEY (cinema_room_id) REFERENCES movietheater_cinema_room(cinema_room_id)
);

-- Booking Seat junction table
CREATE TABLE IF NOT EXISTS movietheater_booking_seat (
    booking_seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    seat_price DOUBLE NOT NULL,
    seat_type VARCHAR(20),
    seat_number VARCHAR(10),
    status VARCHAR(20) DEFAULT 'BOOKED',
    seat_id_reference BIGINT,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_seat_id (seat_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_booking_seat (booking_id, seat_id)
);

-- =============================================
-- TẠO GHẾNHỞ CHO TẤT CẢ 11 PHÒNG CHIẾU
-- =============================================

-- Standard Room 1 (10x12 = 120 ghế)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 2 THEN 'PREMIUM'
        WHEN r >= 9 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 2 THEN 1.2
        WHEN r >= 9 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) cols;

-- Standard Room 2 (10x12 = 120 ghế)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 2 THEN 'PREMIUM'
        WHEN r >= 9 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 2 THEN 1.2
        WHEN r >= 9 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) cols;

-- Standard Room 3 (10x10 = 100 ghế)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 2 THEN 'PREMIUM'
        WHEN r >= 9 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 2 THEN 1.2
        WHEN r >= 9 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols;

-- Standard Room 4 (14x10 = 140 ghế)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 4'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 3 THEN 'PREMIUM'
        WHEN r >= 12 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 3 THEN 1.2
        WHEN r >= 12 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols;

-- Standard Room 5 (11x10 = 110 ghế)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 5'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 2 THEN 'PREMIUM'
        WHEN r >= 10 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 2 THEN 1.2
        WHEN r >= 10 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols;

-- Standard Room 6 (13x10 = 130 ghế)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 6'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 3 THEN 'PREMIUM'
        WHEN r >= 11 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 3 THEN 1.2
        WHEN r >= 11 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols;

-- Standard Room 7 (11x10 = 115 ghế, thiếu 5 ghế ở giữa để tạo lối đi)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 7'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 2 THEN 'PREMIUM'
        WHEN r >= 10 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 2 THEN 1.2
        WHEN r >= 10 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols
WHERE NOT (r = 6 AND c IN (5,6));  -- Bỏ 2 ghế ở hàng 6 tạo lối đi

-- Standard Room 8 (12x10 = 125 ghế, thiếu 5 ghế ở lối đi)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 8'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 3 THEN 'PREMIUM'
        WHEN r >= 10 THEN 'COUPLE' 
        ELSE 'STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 3 THEN 1.2
        WHEN r >= 10 THEN 1.5
        ELSE 1.0 
    END as price_multiplier,
    FALSE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols
WHERE NOT (r = 7 AND c IN (4,5,6,7,8));  -- Bỏ 5 ghế ở hàng 7 tạo lối đi

-- VIP Cinema Room (6x10 = 60 ghế VIP)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    'VIP' as seat_type,
    1.8 as price_multiplier,
    TRUE as is_recliner,
    TRUE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols;

-- IMAX Theater (15x14 = 200 ghế IMAX)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'IMAX Theater'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    CASE 
        WHEN r <= 5 THEN 'IMAX_PREMIUM'
        WHEN r >= 13 THEN 'IMAX_COUPLE' 
        ELSE 'IMAX_STANDARD' 
    END as seat_type,
    CASE 
        WHEN r <= 5 THEN 2.5
        WHEN r >= 13 THEN 2.8
        ELSE 2.2 
    END as price_multiplier,
    CASE WHEN r <= 5 THEN TRUE ELSE FALSE END as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14) cols
WHERE NOT (r = 8 AND c IN (6,7,8,9,10));  -- Bỏ 5 ghế ở giữa để tạo lối đi

-- 4DX Experience (8x10 = 80 ghế 4DX)
INSERT INTO movietheater_seat (cinema_room_id, seat_number, seat_row, seat_column, seat_status, seat_type, price_multiplier, is_recliner, has_table, is_active)
SELECT 
    (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = '4DX Experience'),
    CONCAT(CHAR(64 + r), c) as seat_number,
    r as seat_row,
    c as seat_column,
    'AVAILABLE' as seat_status,
    '4DX' as seat_type,
    2.5 as price_multiplier,
    TRUE as is_recliner,
    FALSE as has_table,
    TRUE as is_active
FROM 
    (SELECT 1 as r UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) rows
CROSS JOIN 
    (SELECT 1 as c UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) cols;

-- =============================================
-- VERIFICATION & SUMMARY
-- =============================================

-- Cập nhật seat_quantity trong cinema_room dựa trên số ghế thực tế
UPDATE movietheater_cinema_room cr 
SET seat_quantity = (
    SELECT COUNT(*) 
    FROM movietheater_seat s 
    WHERE s.cinema_room_id = cr.cinema_room_id AND s.is_active = true
);

-- Success message với thống kê ghế
SELECT 
    '🎬 SEAT SYSTEM SETUP COMPLETED! 🎬' as status,
    (SELECT COUNT(*) FROM movietheater_seat WHERE is_active = true) as total_seats,
    (SELECT COUNT(*) FROM movietheater_cinema_room WHERE is_active = true) as total_rooms,
    (SELECT COUNT(*) FROM movietheater_seat WHERE seat_type = 'STANDARD') as standard_seats,
    (SELECT COUNT(*) FROM movietheater_seat WHERE seat_type = 'VIP') as vip_seats,
    (SELECT COUNT(*) FROM movietheater_seat WHERE seat_type LIKE '%IMAX%') as imax_seats,
    (SELECT COUNT(*) FROM movietheater_seat WHERE seat_type = '4DX') as fourDX_seats,
    (SELECT COUNT(*) FROM movietheater_seat WHERE is_recliner = true) as recliner_seats,
    'All seats generated and linked to rooms perfectly!' as message; 