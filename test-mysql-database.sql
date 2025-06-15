-- Test MySQL Database Functions
-- File test để đảm bảo database hoạt động đúng với MySQL

USE cinema_db;

-- =============================================
-- TEST 1: Kiểm tra stored procedure đã chạy đúng
-- =============================================
SELECT 'TEST 1: Kiểm tra số ghế được tạo' as test_name;

SELECT 
    cr.cinema_room_name,
    cr.row_count,
    cr.column_count,
    cr.row_count * cr.column_count as expected_seats,
    COUNT(s.seat_id) as actual_seats,
    CASE 
        WHEN cr.row_count * cr.column_count = COUNT(s.seat_id) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as test_result
FROM movietheater_cinema_room cr
LEFT JOIN movietheater_seat s ON cr.cinema_room_id = s.cinema_room_id 
WHERE cr.is_active = true
GROUP BY cr.cinema_room_id, cr.cinema_room_name, cr.row_count, cr.column_count
ORDER BY cr.cinema_room_name;

-- =============================================
-- TEST 2: Kiểm tra vòng lặp tạo đúng seat_number
-- =============================================
SELECT 'TEST 2: Kiểm tra format seat_number' as test_name;

SELECT 
    cinema_room_id,
    COUNT(*) as total_seats,
    MIN(seat_number) as first_seat,
    MAX(seat_number) as last_seat,
    COUNT(DISTINCT seat_row) as unique_rows,
    COUNT(DISTINCT seat_column) as unique_columns
FROM movietheater_seat 
WHERE is_active = true
GROUP BY cinema_room_id
ORDER BY cinema_room_id;

-- =============================================
-- TEST 3: Kiểm tra seat_type được gán đúng
-- =============================================
SELECT 'TEST 3: Kiểm tra phân loại ghế' as test_name;

SELECT 
    cr.cinema_room_name,
    s.seat_type,
    COUNT(*) as seat_count,
    MIN(s.price_multiplier) as min_price,
    MAX(s.price_multiplier) as max_price
FROM movietheater_cinema_room cr
JOIN movietheater_seat s ON cr.cinema_room_id = s.cinema_room_id
WHERE s.is_active = true
GROUP BY cr.cinema_room_id, cr.cinema_room_name, s.seat_type
ORDER BY cr.cinema_room_name, s.seat_type;

-- =============================================
-- TEST 4: Kiểm tra dữ liệu phim và lịch chiếu
-- =============================================
SELECT 'TEST 4: Kiểm tra dữ liệu cơ bản' as test_name;

SELECT 
    'Movies' as data_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN status = 'NOW_SHOWING' THEN 1 ELSE 0 END) as now_showing,
    SUM(CASE WHEN status = 'COMING_SOON' THEN 1 ELSE 0 END) as coming_soon
FROM movietheater_movie WHERE is_active = true
UNION ALL
SELECT 
    'Cinema Rooms' as data_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN room_type = 'STANDARD' THEN 1 ELSE 0 END) as standard_rooms,
    SUM(CASE WHEN room_type IN ('VIP', 'IMAX', '4DX') THEN 1 ELSE 0 END) as premium_rooms
FROM movietheater_cinema_room WHERE is_active = true
UNION ALL
SELECT 
    'Schedules' as data_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN show_date = CURDATE() THEN 1 ELSE 0 END) as today_schedules,
    SUM(CASE WHEN auto_generated = true THEN 1 ELSE 0 END) as auto_generated
FROM movietheater_schedule WHERE is_active = true;

-- =============================================
-- TEST 5: Kiểm tra performance indexes
-- =============================================
SELECT 'TEST 5: Kiểm tra indexes đã được tạo' as test_name;

SHOW INDEX FROM movietheater_seat WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM movietheater_schedule WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM movietheater_movie WHERE Key_name LIKE 'idx_%';

-- =============================================
-- TEST 6: Tạo sample data để test auto-schedule
-- =============================================
SELECT 'TEST 6: Simulation auto-schedule data' as test_name;

-- Kiểm tra phim NOW_SHOWING có thể tạo lịch không
SELECT 
    m.title,
    m.status,
    m.auto_schedule_enabled,
    m.min_daily_shows,
    m.max_daily_shows,
    m.preferred_room_types,
    CASE 
        WHEN m.auto_schedule_enabled = true AND m.status = 'NOW_SHOWING' THEN '✅ Ready for auto-schedule'
        ELSE '⚠️ Not ready'
    END as auto_schedule_status
FROM movietheater_movie m
WHERE m.is_active = true
ORDER BY m.status, m.title;

-- =============================================
-- SUMMARY
-- =============================================
SELECT 
    '🎯 MySQL Database Test Complete!' as summary,
    CONCAT('Total Seats: ', (SELECT COUNT(*) FROM movietheater_seat WHERE is_active = true)) as seats_info,
    CONCAT('Total Rooms: ', (SELECT COUNT(*) FROM movietheater_cinema_room WHERE is_active = true)) as rooms_info,
    CONCAT('NOW_SHOWING Movies: ', (SELECT COUNT(*) FROM movietheater_movie WHERE status = 'NOW_SHOWING' AND is_active = true)) as movies_info,
    'Database is MySQL-compatible! 🚀' as compatibility_status; 