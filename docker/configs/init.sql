-- Movie Theater Database Initialization
-- Updated với phim thực tế từ tháng 6/2025 trở đi (ngày hiện tại: 12/06/2025)

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS cinema_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinema_db;
GRANT ALL PRIVILEGES ON cinema_db.* TO 'cinema_user'@'%';
FLUSH PRIVILEGES;

-- Account table
CREATE TABLE IF NOT EXISTS movietheater_account (
                                                    account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    date_of_birth DATE,
    address TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    membership_points INT NOT NULL DEFAULT 0,
    membership_level VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    membership_expiry_date DATE,
    employee_code VARCHAR(20),
    hire_date DATE,
    department VARCHAR(50),
    salary DECIMAL(15,2),
    manager_id BIGINT,
    avatar_url VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_membership_level (membership_level),
    INDEX idx_employee_code (employee_code),
    FOREIGN KEY (manager_id) REFERENCES movietheater_account(account_id)
    );

-- Movie table với auto-schedule fields
CREATE TABLE IF NOT EXISTS movietheater_movie (
                                                  movie_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                  title VARCHAR(200) NOT NULL,
    original_title VARCHAR(200),
    description TEXT,
    duration INT NOT NULL,
    genres VARCHAR(100),
    director VARCHAR(100),
    cast TEXT,
    language VARCHAR(50),
    country VARCHAR(50),
    release_date DATE,
    end_date DATE,
    rating VARCHAR(10),
    poster_url VARCHAR(255),
    backdrop_url VARCHAR(255),
    trailer_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    price DOUBLE NOT NULL,
    status VARCHAR(20) DEFAULT 'COMING_SOON',
    imdb_rating DOUBLE,
    production_company VARCHAR(100),
    budget BIGINT,
    box_office BIGINT,
    auto_schedule_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority_score INT DEFAULT 5,
    min_daily_shows INT DEFAULT 2,
    max_daily_shows INT DEFAULT 4,
    preferred_room_types VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_title (title),
    INDEX idx_release_date (release_date),
    INDEX idx_end_date (end_date),
    INDEX idx_active (is_active),
    INDEX idx_status (status),
    INDEX idx_genres (genres),
    INDEX idx_auto_schedule (auto_schedule_enabled),
    INDEX idx_priority (priority_score)
    );

-- Cinema Room table
CREATE TABLE IF NOT EXISTS movietheater_cinema_room (
                                                        cinema_room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                        cinema_room_name VARCHAR(50) UNIQUE NOT NULL,
    seat_quantity INT NOT NULL,
    room_type VARCHAR(20) DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    row_count INT NOT NULL,
    column_count INT NOT NULL,
    has_3d BOOLEAN NOT NULL DEFAULT FALSE,
    has_dolby_atmos BOOLEAN NOT NULL DEFAULT FALSE,
    has_recliner_seats BOOLEAN NOT NULL DEFAULT FALSE,
    price_multiplier DOUBLE NOT NULL DEFAULT 1.0,
    is_imax BOOLEAN NOT NULL DEFAULT FALSE,
    is_4dx BOOLEAN NOT NULL DEFAULT FALSE,
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    max_concurrent_shows INT DEFAULT 8,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_room_name (cinema_room_name),
    INDEX idx_room_type (room_type),
    INDEX idx_active (is_active),
    INDEX idx_imax (is_imax),
    INDEX idx_4dx (is_4dx),
    INDEX idx_vip (is_vip)
    );

-- Schedule table
CREATE TABLE IF NOT EXISTS movietheater_schedule (
                                                     schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                     movie_id BIGINT NOT NULL,
                                                     cinema_room_id BIGINT NOT NULL,
                                                     show_date DATE NOT NULL,
                                                     start_time TIME NOT NULL,
                                                     end_time TIME NOT NULL,
                                                     price DOUBLE NOT NULL,
                                                     is_active BOOLEAN NOT NULL DEFAULT TRUE,
                                                     status VARCHAR(20) DEFAULT 'SCHEDULED',
    is_3d BOOLEAN NOT NULL DEFAULT FALSE,
    is_imax BOOLEAN NOT NULL DEFAULT FALSE,
    is_4dx BOOLEAN NOT NULL DEFAULT FALSE,
    subtitle_language VARCHAR(50),
    audio_language VARCHAR(50),
    available_seats INT NOT NULL,
    booked_seats INT NOT NULL DEFAULT 0,
    auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
    generation_batch_id VARCHAR(100),
    time_slot_type VARCHAR(20),
    occupancy_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_show_date (show_date),
    INDEX idx_start_time (start_time),
    INDEX idx_movie_room (movie_id, cinema_room_id),
    INDEX idx_active (is_active),
    INDEX idx_status (status),
    INDEX idx_auto_generated (auto_generated),
    INDEX idx_batch_id (generation_batch_id),
    FOREIGN KEY (movie_id) REFERENCES movietheater_movie(movie_id),
    FOREIGN KEY (cinema_room_id) REFERENCES movietheater_cinema_room(cinema_room_id)
    );

-- Auto-schedule log table
CREATE TABLE IF NOT EXISTS auto_schedule_log (
                                                 log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 batch_id VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    target_date DATE NOT NULL,
    movies_processed INT DEFAULT 0,
    schedules_created INT DEFAULT 0,
    rooms_used INT DEFAULT 0,
    execution_time_ms BIGINT DEFAULT 0,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    details JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'SYSTEM',
    INDEX idx_batch_id (batch_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_target_date (target_date),
    INDEX idx_created_at (created_at)
    );

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
-- ... existing code ...

-- =============================================
-- THÊM TÀI KHOẢN ADMIN VÀ MEMBER
-- =============================================

-- Tạo tài khoản Admin
INSERT INTO movietheater_account (
    username,
    email,
    password,
    full_name,
    phone_number,
    role,
    is_active,
    is_verified,
    email_verified,
    membership_points,
    membership_level,
    created_at,
    updated_at,
    created_by
) VALUES (
             'admin',
             'admin@lumierecinema.com',
             '$2a$12$LQv3c1yqBWVHxkd0LQ1lsO.9wXpKzOGSWUQsNs6QQqBXvGFxl6.0S', -- BCrypt hash cho "12345Aa!"
             'Administrator',
             '0123456789',
             'ADMIN',
             TRUE,
             TRUE,
             TRUE,
             0,
             'PLATINUM',
             NOW(),
             NOW(),
             'SYSTEM'
         );

-- Tạo tài khoản Member
INSERT INTO movietheater_account (
    username,
    email,
    password,
    full_name,
    phone_number,
    role,
    is_active,
    is_verified,
    email_verified,
    membership_points,
    membership_level,
    created_at,
    updated_at,
    created_by
) VALUES (
             'member',
             'member@lumierecinema.com',
             '$2a$12$LQv3c1yqBWVHxkd0LQ1lsO.9wXpKzOGSWUQsNs6QQqBXvGFxl6.0S', -- BCrypt hash cho "12345Aa!"
             'Member User',
             '0987654321',
             'MEMBER',
             TRUE,
             TRUE,
             TRUE,
             1000,
             'GOLD',
             NOW(),
             NOW(),
             'SYSTEM'
         );

-- Thông báo tài khoản đã tạo
SELECT
    '🎯 TÀI KHOẢN TEST ĐÃ TẠO THÀNH CÔNG!' as status,
    'Username: admin | Password: 12345Aa! | Role: ADMIN' as taikhoan_admin,
    'Username: member | Password: 12345Aa! | Role: MEMBER' as taikhoan_member,
    '✅ Cả 2 tài khoản đã ACTIVE và VERIFIED' as trang_thai,
    'Sẵn sàng đăng nhập!' as ghi_chu;


INSERT IGNORE INTO movietheater_cinema_room (
    cinema_room_name, seat_quantity, room_type, is_active, description, row_count, column_count, 
    has_3d, has_dolby_atmos, has_recliner_seats, price_multiplier, is_imax, is_4dx, is_vip, created_at, updated_at
) VALUES 
-- 3 phòng Standard chính
('Standard Room 1', 120, 'STANDARD', true, 'Phòng chiếu tiêu chuẩn với hệ thống âm thanh Dolby Atmos', 10, 12, true, true, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 2', 120, 'STANDARD', true, 'Phòng chiếu lớn với sức chứa tối đa', 14, 10, true, true, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 3', 120, 'STANDARD', true, 'Phòng chiếu nhỏ gọn với thiết kế hiện đại', 10, 10, true, false, false, 1.0, false, false, false, NOW(), NOW()),

-- 1 phòng đặc biệt
('VIP Cinema Room', 60, 'VIP', true, 'Trải nghiệm VIP sang trọng với ghế massage và bàn ăn', 6, 10, true, true, true, 1.8, false, false, true, NOW(), NOW());


-- REAL MOVIES từ tháng 6/2025 trở đi
INSERT INTO movietheater_movie (
    title, original_title, description, duration, genres, director, cast, language, country,
    release_date, end_date, rating, poster_url, backdrop_url, trailer_url,
    is_active, is_featured, price, status, imdb_rating, production_company,
    auto_schedule_enabled, priority_score, min_daily_shows, max_daily_shows, preferred_room_types
) VALUES
-- NOW_SHOWING (đang chiếu từ 6/2025)
('From the World of John Wick: Ballerina', 'Ballerina', 'Ana de Armas trong vai nữ sát thủ báo thù trong vũ trụ John Wick.', 109, 'Action, Thriller', 'Len Wiseman', 'Ana de Armas, Keanu Reeves, Norman Reedus', 'English', 'USA', '2025-06-06', '2025-09-06', 'R', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/a1e85f97-7146-42de-b2af-cb66f5e50beb.jpg', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/backdrops/b8d6b892-f315-4ee4-97ad-6a55cf8493f3.jpg', 'https://www.youtube.com/watch?v=ballerina_trailer', TRUE, TRUE, 150000, 'NOW_SHOWING', 7.8, 'Lionsgate Films', TRUE, 9, 3, 5, 'STANDARD,IMAX,VIP'),

('How to Train Your Dragon', 'How to Train Your Dragon (Live-Action)', 'Phiên bản live-action về chàng trai Viking kết bạn với rồng.', 104, 'Adventure, Family, Fantasy', 'Dean DeBlois', 'Mason Thames, Nico Parker, Gerard Butler', 'English', 'USA', '2025-06-13', '2025-09-13', 'PG', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/b3a7dcad-a4d1-4747-ae48-354e6c5a1eea.jpg', 'https://image.tmdb.org/t/p/w1920/httyd_backdrop.jpg', 'https://www.youtube.com/watch?v=httyd_trailer', TRUE, TRUE, 140000, 'NOW_SHOWING', 7.2, 'Universal Pictures', TRUE, 8, 3, 5, 'STANDARD,IMAX,4DX'),

('Materialists', 'Materialists', 'Cô gái mai mối ở New York bị kẹt giữa tình yêu hoàn hảo và người yêu cũ.', 115, 'Comedy, Romance', 'Celine Song', 'Dakota Johnson, Chris Evans, Pedro Pascal', 'English', 'USA', '2025-06-13', '2025-09-13', 'R', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/d3ec6cb4-6911-42c1-96e5-6ad7b3961a0c.jpg', 'https://image.tmdb.org/t/p/w1920/materialists_backdrop.jpg', 'https://www.youtube.com/watch?v=materialists_trailer', TRUE, TRUE, 130000, 'NOW_SHOWING', 6.9, 'A24', TRUE, 7, 2, 4, 'STANDARD,VIP'),

('28 Years Later', '28 Years Later', 'Virus rage trở lại tàn phá nhân loại trong phần tiếp theo 28 Weeks Later.', 118, 'Horror, Thriller', 'Danny Boyle', 'Jodie Comer, Aaron Taylor-Johnson, Cillian Murphy', 'English', 'UK', '2025-06-20', '2025-09-20', 'R', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/75ad0f6a-d67b-46b3-806d-9fd89e44b7b7.jpg', 'https://image.tmdb.org/t/p/w1920/28years_backdrop.jpg', 'https://www.youtube.com/watch?v=28years_trailer', TRUE, TRUE, 160000, 'NOW_SHOWING', 8.1, 'Sony Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX'),

('Elio', 'Elio', 'Cậu bé được đưa qua thiên hà và nhầm làm đại sứ cho hành tinh Trái Đất.', 101, 'Animation, Adventure, Family', 'Adrian Molina', 'Yonas Kibreab, America Ferrera, Zoe Saldana', 'English', 'USA', '2025-06-20', '2025-09-20', 'PG', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/bf2ec2d6-26f5-40e5-99a1-c8d15b480f77.jpg', 'https://image.tmdb.org/t/p/w1920/elio_backdrop.jpg', 'https://www.youtube.com/watch?v=elio_trailer', TRUE, TRUE, 120000, 'NOW_SHOWING', 7.5, 'Pixar Animation Studios', TRUE, 8, 3, 4, 'STANDARD,4DX'),

('Mission: Impossible - The Final Reckoning', 'Mission: Impossible - The Final Reckoning', 'Ethan Hunt đối mặt nhiệm vụ nguy hiểm nhất trong phần kết của series.', 163, 'Action, Adventure, Thriller', 'Christopher McQuarrie', 'Tom Cruise, Hayley Atwell, Ving Rhames', 'English', 'USA', '2025-05-23', '2025-09-23', 'PG-13', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/25146c4e-d95e-4b39-8f34-375976bfe6dd.jpg', 'https://image.tmdb.org/t/p/w1920/mi_backdrop.jpg', 'https://www.youtube.com/watch?v=mi_trailer', TRUE, TRUE, 180000, 'NOW_SHOWING', 8.7, 'Paramount Pictures', TRUE, 10, 3, 5, 'STANDARD,IMAX'),

-- COMING_SOON (sắp chiếu)
('F1: The Movie', 'F1', 'Tay đua F1 nghỉ hưu trở lại hướng dẫn tay đua trẻ.', 155, 'Action, Drama, Sport', 'Joseph Kosinski', 'Brad Pitt, Damson Idris, Javier Bardem', 'English', 'USA', '2025-06-27', '2025-10-27', 'PG-13', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/5dfaa3d7-c7b4-4f2b-9259-14e1c1c3017c.jpg', 'https://image.tmdb.org/t/p/w1920/f1_backdrop.jpg', 'https://www.youtube.com/watch?v=f1_trailer', TRUE, TRUE, 180000, 'COMING_SOON', 8.3, 'Warner Bros. Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX'),

('M3GAN 2.0', 'M3GAN 2.0', 'M3GAN trở lại với nâng cấp chết người.', 119, 'Horror, Science Fiction', 'Gerard Johnstone', 'Allison Williams, Violet McGraw, Jemaine Clement', 'English', 'USA', '2025-06-27', '2025-10-27', 'PG-13', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/a03dbeb5-859c-4314-962c-b5fb8cc077b3.jpg', 'https://image.tmdb.org/t/p/w1920/megan2_backdrop.jpg', 'https://www.youtube.com/watch?v=megan2_trailer', TRUE, TRUE, 150000, 'COMING_SOON', 7.4, 'Universal Pictures', TRUE, 8, 3, 5, 'STANDARD,IMAX'),

('Jurassic World: Rebirth', 'Jurassic World: Rebirth', 'Nhiệm vụ khai thác DNA khủng long cho nghiên cứu y học.', 134, 'Action, Adventure, Science Fiction', 'Gareth Edwards', 'Scarlett Johansson, Jonathan Bailey, Mahershala Ali', 'English', 'USA', '2025-07-02', '2025-11-02', 'PG-13', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/550dee9e-b1a3-4ac3-970c-d9683929017a.jpg', 'https://image.tmdb.org/t/p/w1920/jw_backdrop.jpg', 'https://www.youtube.com/watch?v=jw_trailer', TRUE, TRUE, 170000, 'COMING_SOON', 8.0, 'Universal Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX,4DX'),

('Superman', 'Superman', 'Man of Steel trở lại trong bản khởi động lại epic.', 129, 'Action, Adventure, Science Fiction', 'James Gunn', 'David Corenswet, Rachel Brosnahan, Nicholas Hoult', 'English', 'USA', '2025-07-11', '2025-11-11', 'PG-13', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/51ad98ed-cb24-443c-b329-ed11db19216c.jpg', 'https://image.tmdb.org/t/p/w1920/superman_backdrop.jpg', 'https://www.youtube.com/watch?v=superman_trailer', TRUE, TRUE, 180000, 'COMING_SOON', 8.5, 'DC Studios', TRUE, 10, 4, 6, 'STANDARD,IMAX'),

('I Know What You Did Last Summer', 'I Know What You Did Last Summer', 'Thế hệ mới đối mặt hậu quả của bí mật đen tối.', 108, 'Horror, Thriller', 'Jennifer Kaytin Robinson', 'Madelyn Cline, Chase Sui Wonders, Jonah Hauer-King', 'English', 'USA', '2025-07-18', '2025-10-18', 'R', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/57123d13-3983-4e6d-8cb2-3652ab9aec67.jpg', 'https://image.tmdb.org/t/p/w1920/ikwydls_backdrop.jpg', 'https://www.youtube.com/watch?v=ikwydls_trailer', TRUE, TRUE, 140000, 'COMING_SOON', 6.8, 'Sony Pictures', TRUE, 7, 2, 4, 'STANDARD,IMAX'),

('The Fantastic Four: First Steps', 'The Fantastic Four: First Steps', 'Gia đình đầu tiên của Marvel trở lại chống Galactus.', 130, 'Action, Adventure, Science Fiction', 'Matt Shakman', 'Pedro Pascal, Vanessa Kirby, Joseph Quinn', 'English', 'USA', '2025-07-25', '2025-11-25', 'PG-13', 'https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/posters/3aa59057-6000-43b1-9d0e-90a06404fcde.jpg', 'https://image.tmdb.org/t/p/w1920/ff_backdrop.jpg', 'https://www.youtube.com/watch?v=ff_trailer', TRUE, TRUE, 170000, 'COMING_SOON', 8.2, 'Marvel Studios', TRUE, 9, 3, 5, 'STANDARD,IMAX');

-- MINIMAL SCHEDULES - CHỈ MẪU CHO HÔM NAY
SET @std_room1 = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1' LIMIT 1);
SET @std_room2 = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2' LIMIT 1);
SET @vip_room = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room' LIMIT 1);

SET @ballerina_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'From the World of John Wick: Ballerina' LIMIT 1);
SET @httyd_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'How to Train Your Dragon' LIMIT 1);
SET @materialists_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Materialists' LIMIT 1);

-- Chỉ 3 lịch chiếu mẫu cho hôm nay để test auto-schedule
INSERT IGNORE INTO movietheater_schedule (
    movie_id, cinema_room_id, show_date, start_time, end_time, price,
    is_active, status, is_3d, is_imax, is_4dx, subtitle_language,
    audio_language, available_seats, booked_seats, auto_generated,
    time_slot_type, created_at, updated_at
) VALUES 
(@ballerina_id, @std_room1, CURDATE(), '09:00:00', '10:49:00', 150000, true, 'SCHEDULED', 
 false, false, false, 'Vietnamese', 'English', 120, 0, false, 'MORNING', NOW(), NOW()),
(@httyd_id, @std_room2, CURDATE(), '14:30:00', '16:14:00', 140000, true, 'SCHEDULED', 
 false, false, false, 'Vietnamese', 'English', 140, 0, false, 'AFTERNOON', NOW(), NOW()),
(@materialists_id, @vip_room, CURDATE(), '21:00:00', '22:55:00', 234000, true, 'SCHEDULED', 
 false, false, false, 'Vietnamese', 'English', 60, 0, false, 'EVENING', NOW(), NOW());
 
-- Promotion table (simplified structure)
CREATE TABLE IF NOT EXISTS movietheater_promotion
(
    promotion_id
    BIGINT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    promotion_code
    VARCHAR
(
    20
) UNIQUE NOT NULL,
    promotion_name VARCHAR
(
    100
) NOT NULL,
    description TEXT,
    discount_type VARCHAR
(
    20
) NOT NULL, -- PERCENTAGE, FIXED, POINTS
    discount_value DOUBLE NOT NULL,
    max_discount_amount DOUBLE,
    min_purchase_amount DOUBLE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_usage_count INT NOT NULL DEFAULT 1000,
    current_usage_count INT NOT NULL DEFAULT 0,
    max_usage_per_user INT NOT NULL DEFAULT 1,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    banner_image_url VARCHAR
(
    255
),
    points_required INT DEFAULT 0,
    code_validity_hours INT DEFAULT 24,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR
(
    50
),
    updated_by VARCHAR
(
    50
),
    INDEX idx_promotion_code
(
    promotion_code
),
    INDEX idx_active
(
    is_active
),
    INDEX idx_start_date
(
    start_date
),
    INDEX idx_end_date
(
    end_date
),
    INDEX idx_discount_type
(
    discount_type
),
    INDEX idx_featured
(
    is_featured
),
    INDEX idx_points_required
(
    points_required
)
    );

-- Sample promotion data
INSERT INTO movietheater_promotion (promotion_code, promotion_name, description, discount_type, discount_value,
                                    max_discount_amount, min_purchase_amount, start_date, end_date,
                                    max_usage_count, current_usage_count, max_usage_per_user, is_featured,
                                    banner_image_url, points_required, code_validity_hours, is_active,
                                    created_at, updated_at, created_by)
VALUES
-- Percentage discount promotion
('SUMMER2025', 'Khuyến mãi hè 2025', 'Giảm giá 20% cho tất cả các vé trong tháng 7', 'PERCENTAGE', 20.0,
 50000, 100000, '2025-07-01', '2025-07-31',
 1000, 0, 2, TRUE,
 'https://example.com/banners/summer2025.jpg', 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Fixed amount discount promotion
('WELCOME50K', 'Chào mừng khách hàng mới', 'Giảm 50,000 VNĐ cho đơn hàng đầu tiên', 'FIXED', 50000,
 50000, 150000, '2025-06-01', '2025-12-31',
 500, 0, 1, FALSE,
 'https://example.com/banners/welcome.jpg', 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Points-based promotion
('POINTS100', 'Đổi điểm ưu đãi', 'Đổi 100 điểm để giảm 30,000 VNĐ', 'POINTS', 30000,
 30000, 50000, '2025-06-01', '2025-12-31',
 200, 0, 5, TRUE,
 'https://example.com/banners/points.jpg', 100, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- VIP promotion
('VIP30', 'Ưu đãi VIP', 'Giảm 30% cho khách hàng VIP', 'PERCENTAGE', 30.0,
 100000, 200000, '2025-06-01', '2025-12-31',
 100, 0, 3, TRUE,
 'https://example.com/banners/vip.jpg', 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Student promotion
('STUDENT15', 'Ưu đãi sinh viên', 'Giảm 15% cho sinh viên', 'PERCENTAGE', 15.0,
 30000, 80000, '2025-06-01', '2025-12-31',
 2000, 0, 2, FALSE,
 'https://example.com/banners/student.jpg', 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM');

-- User Promotion Code table (for tracking individual user codes)
CREATE TABLE IF NOT EXISTS movietheater_user_promotion_code
(
    user_promotion_code_id
    BIGINT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    account_id
    BIGINT
    NOT
    NULL,
    promotion_id
    BIGINT
    NOT
    NULL,
    unique_code
    VARCHAR
(
    50
) UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    points_spent INT DEFAULT 0,
    purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_account_id
(
    account_id
),
    INDEX idx_promotion_id
(
    promotion_id
),
    INDEX idx_unique_code
(
    unique_code
),
    INDEX idx_is_used
(
    is_used
),
    INDEX idx_is_active
(
    is_active
),
    INDEX idx_expires_at
(
    expires_at
),
    FOREIGN KEY
(
    account_id
) REFERENCES movietheater_account
(
    account_id
),
    FOREIGN KEY
(
    promotion_id
) REFERENCES movietheater_promotion
(
    promotion_id
)
    );

-- Concession table
CREATE TABLE IF NOT EXISTS movietheater_concession
(
    concession_id
    BIGINT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    name
    VARCHAR
(
    100
) NOT NULL,
    description TEXT,
    category VARCHAR
(
    50
) NOT NULL, -- POPCORN, DRINK, FOOD, COMBO
    price DECIMAL
(
    10,
    2
) NOT NULL,
    image_url VARCHAR
(
    255
),
    flavor VARCHAR
(
    50
),
    size VARCHAR
(
    50
),
    stock_quantity INT NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR
(
    50
),
    updated_by VARCHAR
(
    50
),
    INDEX idx_category
(
    category
),
    INDEX idx_available
(
    is_available
),
    INDEX idx_active
(
    is_active
),
    INDEX idx_display_order
(
    display_order
)
    );

-- Sample concession data
INSERT INTO movietheater_concession (name, description, category, price, image_url, flavor, size,
                                     stock_quantity, is_available, is_active, display_order,
                                     created_at, updated_at, created_by)
VALUES
-- Popcorn
('Bắp rang bơ', 'Bắp rang bơ vị truyền thống, thơm ngon, giòn rụm', 'POPCORN', 35000,
 'https://example.com/images/popcorn-butter.jpg', 'Truyền thống', 'Lớn',
 100, TRUE, TRUE, 1,
 NOW(), NOW(), 'SYSTEM'),

('Bắp rang phô mai', 'Bắp rang phô mai đậm đà, béo ngậy', 'POPCORN', 40000,
 'https://example.com/images/popcorn-cheese.jpg', 'Phô mai', 'Lớn',
 80, TRUE, TRUE, 2,
 NOW(), NOW(), 'SYSTEM'),

('Bắp rang caramel', 'Bắp rang caramel ngọt ngào, giòn tan', 'POPCORN', 45000,
 'https://example.com/images/popcorn-caramel.jpg', 'Caramel', 'Lớn',
 60, TRUE, TRUE, 3,
 NOW(), NOW(), 'SYSTEM'),

-- Drinks
('Coca Cola', 'Nước ngọt Coca Cola mát lạnh', 'DRINK', 25000,
 'https://example.com/images/coca-cola.jpg', 'Cola', 'Lớn',
 150, TRUE, TRUE, 4,
 NOW(), NOW(), 'SYSTEM'),

('Pepsi', 'Nước ngọt Pepsi sảng khoái', 'DRINK', 25000,
 'https://example.com/images/pepsi.jpg', 'Cola', 'Lớn',
 120, TRUE, TRUE, 5,
 NOW(), NOW(), 'SYSTEM'),

('Sprite', 'Nước ngọt Sprite thanh mát', 'DRINK', 25000,
 'https://example.com/images/sprite.jpg', 'Chanh', 'Lớn',
 100, TRUE, TRUE, 6,
 NOW(), NOW(), 'SYSTEM'),

('Nước suối', 'Nước suối tinh khiết', 'DRINK', 15000,
 'https://example.com/images/water.jpg', 'Không vị', '500ml',
 200, TRUE, TRUE, 7,
 NOW(), NOW(), 'SYSTEM'),

-- Food
('Hot dog', 'Bánh hot dog với xúc xích và rau củ', 'FOOD', 55000,
 'https://example.com/images/hotdog.jpg', 'Truyền thống', 'Tiêu chuẩn',
 50, TRUE, TRUE, 8,
 NOW(), NOW(), 'SYSTEM'),

('Khoai tây chiên', 'Khoai tây chiên giòn rụm', 'FOOD', 45000,
 'https://example.com/images/fries.jpg', 'Muối', 'Lớn',
 80, TRUE, TRUE, 9,
 NOW(), NOW(), 'SYSTEM'),

('Gà rán', 'Gà rán giòn với sốt đặc biệt', 'FOOD', 75000,
 'https://example.com/images/fried-chicken.jpg', 'Truyền thống', '3 miếng',
 40, TRUE, TRUE, 10,
 NOW(), NOW(), 'SYSTEM'),

-- Combos
('Combo Bắp + Nước', 'Bắp rang bơ lớn + Coca Cola lớn', 'COMBO', 55000,
 'https://example.com/images/combo-popcorn-drink.jpg', 'Truyền thống', 'Lớn',
 60, TRUE, TRUE, 11,
 NOW(), NOW(), 'SYSTEM'),

('Combo VIP', 'Bắp rang phô mai + Coca Cola + Khoai tây chiên', 'COMBO', 95000,
 'https://example.com/images/combo-vip.jpg', 'Phô mai', 'Lớn',
 30, TRUE, TRUE, 12,
 NOW(), NOW(), 'SYSTEM');

-- Booking table
CREATE TABLE IF NOT EXISTS movietheater_booking
(
    booking_id
    BIGINT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    account_id
    BIGINT
    NOT
    NULL,
    schedule_id
    BIGINT
    NOT
    NULL,
    promotion_id
    BIGINT,
    total_amount
    DECIMAL
(
    10,
    2
) NOT NULL,
    discount_amount DECIMAL
(
    10,
    2
) DEFAULT 0.00,
    final_amount DECIMAL
(
    10,
    2
) NOT NULL,
    booking_status VARCHAR
(
    20
) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, COMPLETED
    payment_status VARCHAR
(
    20
) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    payment_method VARCHAR
(
    20
),
    transaction_id VARCHAR
(
    100
),
    booking_code VARCHAR
(
    20
) UNIQUE NOT NULL,
    customer_name VARCHAR
(
    100
) NOT NULL,
    customer_phone VARCHAR
(
    15
),
    customer_email VARCHAR
(
    100
),
    special_requests TEXT,
    booking_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR
(
    50
),
    updated_by VARCHAR
(
    50
),
    INDEX idx_account_id
(
    account_id
),
    INDEX idx_schedule_id
(
    schedule_id
),
    INDEX idx_promotion_id
(
    promotion_id
),
    INDEX idx_booking_status
(
    booking_status
),
    INDEX idx_payment_status
(
    payment_status
),
    INDEX idx_booking_code
(
    booking_code
),
    INDEX idx_created_at
(
    created_at
),
    FOREIGN KEY
(
    account_id
) REFERENCES movietheater_account
(
    account_id
),
    FOREIGN KEY
(
    schedule_id
) REFERENCES movietheater_schedule
(
    schedule_id
),
    FOREIGN KEY
(
    promotion_id
) REFERENCES movietheater_promotion
(
    promotion_id
)
    );

-- Booking Concession table (for tracking concessions in bookings)
CREATE TABLE IF NOT EXISTS movietheater_booking_concession
(
    booking_concession_id
    BIGINT
    AUTO_INCREMENT
    PRIMARY
    KEY,
    booking_id
    BIGINT
    NOT
    NULL,
    concession_id
    BIGINT
    NOT
    NULL,
    quantity
    INT
    NOT
    NULL
    DEFAULT
    1,
    unit_price
    DECIMAL
(
    10,
    2
) NOT NULL,
    total_price DECIMAL
(
    10,
    2
) NOT NULL,
    special_instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_booking_id
(
    booking_id
),
    INDEX idx_concession_id
(
    concession_id
),
    FOREIGN KEY
(
    booking_id
) REFERENCES movietheater_booking
(
    booking_id
),
    FOREIGN KEY
(
    concession_id
) REFERENCES movietheater_concession
(
    concession_id
)
    );

----TẠO GHẾ----------------------------------------------------------------
INSERT INTO movietheater_seat (
    cinema_room_id, seat_number, seat_row, seat_column,
    seat_status, seat_type, price_multiplier,
    is_recliner, has_table, is_active,
    created_at, updated_at
) VALUES
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A1', 1, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A2', 1, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A3', 1, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A4', 1, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A5', 1, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A6', 1, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A7', 1, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A8', 1, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A9', 1, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A10', 1, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A11', 1, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'A12', 1, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B1', 2, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B2', 2, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B3', 2, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B4', 2, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B5', 2, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B6', 2, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B7', 2, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B8', 2, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B9', 2, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B10', 2, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B11', 2, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'B12', 2, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C1', 3, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C2', 3, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C3', 3, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C4', 3, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C5', 3, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C6', 3, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C7', 3, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C8', 3, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C9', 3, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C10', 3, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C11', 3, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'C12', 3, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D1', 4, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D2', 4, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D3', 4, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D4', 4, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D5', 4, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D6', 4, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D7', 4, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D8', 4, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D9', 4, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D10', 4, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D11', 4, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'D12', 4, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E1', 5, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E2', 5, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E3', 5, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E4', 5, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E5', 5, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E6', 5, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E7', 5, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E8', 5, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E9', 5, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E10', 5, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E11', 5, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'E12', 5, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F1', 6, 1, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F2', 6, 2, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F3', 6, 3, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F4', 6, 4, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F5', 6, 5, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F6', 6, 6, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F7', 6, 7, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F8', 6, 8, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F9', 6, 9, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F10', 6, 10, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F11', 6, 11, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'F12', 6, 12, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G1', 7, 1, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G2', 7, 2, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G3', 7, 3, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G4', 7, 4, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G5', 7, 5, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G6', 7, 6, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G7', 7, 7, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G8', 7, 8, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G9', 7, 9, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G10', 7, 10, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G11', 7, 11, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'G12', 7, 12, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H1', 8, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H2', 8, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H3', 8, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H4', 8, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H5', 8, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H6', 8, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H7', 8, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H8', 8, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H9', 8, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H10', 8, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H11', 8, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'H12', 8, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I1', 9, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I2', 9, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I3', 9, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I4', 9, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I5', 9, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I6', 9, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I7', 9, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I8', 9, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I9', 9, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I10', 9, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I11', 9, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'I12', 9, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J1', 10, 1, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J2', 10, 2, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J3', 10, 3, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J4', 10, 4, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J5', 10, 5, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J6', 10, 6, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J7', 10, 7, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J8', 10, 8, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J9', 10, 9, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J10', 10, 10, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J11', 10, 11, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1'), 'J12', 10, 12, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW());
-- Standard Room 2----------------------------------------------------------------------
INSERT INTO movietheater_seat (
    cinema_room_id, seat_number, seat_row, seat_column,
    seat_status, seat_type, price_multiplier,
    is_recliner, has_table, is_active,
    created_at, updated_at
) VALUES
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A1', 1, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A2', 1, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A3', 1, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A4', 1, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A5', 1, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A6', 1, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A7', 1, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A8', 1, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A9', 1, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A10', 1, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A11', 1, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'A12', 1, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B1', 2, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B2', 2, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B3', 2, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B4', 2, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B5', 2, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B6', 2, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B7', 2, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B8', 2, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B9', 2, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B10', 2, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B11', 2, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'B12', 2, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C1', 3, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C2', 3, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C3', 3, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C4', 3, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C5', 3, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C6', 3, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C7', 3, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C8', 3, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C9', 3, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C10', 3, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C11', 3, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'C12', 3, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D1', 4, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D2', 4, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D3', 4, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D4', 4, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D5', 4, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D6', 4, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D7', 4, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D8', 4, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D9', 4, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D10', 4, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D11', 4, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'D12', 4, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E1', 5, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E2', 5, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E3', 5, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E4', 5, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E5', 5, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E6', 5, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E7', 5, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E8', 5, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E9', 5, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E10', 5, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E11', 5, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'E12', 5, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F1', 6, 1, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F2', 6, 2, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F3', 6, 3, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F4', 6, 4, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F5', 6, 5, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F6', 6, 6, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F7', 6, 7, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F8', 6, 8, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F9', 6, 9, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F10', 6, 10, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F11', 6, 11, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'F12', 6, 12, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G1', 7, 1, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G2', 7, 2, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G3', 7, 3, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G4', 7, 4, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G5', 7, 5, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G6', 7, 6, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G7', 7, 7, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G8', 7, 8, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G9', 7, 9, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G10', 7, 10, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G11', 7, 11, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'G12', 7, 12, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H1', 8, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H2', 8, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H3', 8, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H4', 8, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H5', 8, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H6', 8, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H7', 8, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H8', 8, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H9', 8, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H10', 8, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H11', 8, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'H12', 8, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I1', 9, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I2', 9, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I3', 9, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I4', 9, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I5', 9, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I6', 9, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I7', 9, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I8', 9, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I9', 9, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I10', 9, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I11', 9, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'I12', 9, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J1', 10, 1, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J2', 10, 2, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J3', 10, 3, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J4', 10, 4, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J5', 10, 5, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J6', 10, 6, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J7', 10, 7, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J8', 10, 8, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J9', 10, 9, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J10', 10, 10, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J11', 10, 11, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2'), 'J12', 10, 12, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW());
-- Standard Room 3----------------------------------------------------------------------
INSERT INTO movietheater_seat (
    cinema_room_id, seat_number, seat_row, seat_column,
    seat_status, seat_type, price_multiplier,
    is_recliner, has_table, is_active,
    created_at, updated_at
) VALUES
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A1', 1, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A2', 1, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A3', 1, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A4', 1, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A5', 1, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A6', 1, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A7', 1, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A8', 1, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A9', 1, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A10', 1, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A11', 1, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'A12', 1, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B1', 2, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B2', 2, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B3', 2, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B4', 2, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B5', 2, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B6', 2, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B7', 2, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B8', 2, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B9', 2, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B10', 2, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B11', 2, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'B12', 2, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C1', 3, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C2', 3, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C3', 3, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C4', 3, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C5', 3, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C6', 3, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C7', 3, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C8', 3, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C9', 3, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C10', 3, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C11', 3, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'C12', 3, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D1', 4, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D2', 4, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D3', 4, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D4', 4, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D5', 4, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D6', 4, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D7', 4, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D8', 4, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D9', 4, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D10', 4, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D11', 4, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'D12', 4, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E1', 5, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E2', 5, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E3', 5, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E4', 5, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E5', 5, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E6', 5, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E7', 5, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E8', 5, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E9', 5, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E10', 5, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E11', 5, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'E12', 5, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F1', 6, 1, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F2', 6, 2, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F3', 6, 3, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F4', 6, 4, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F5', 6, 5, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F6', 6, 6, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F7', 6, 7, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F8', 6, 8, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F9', 6, 9, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F10', 6, 10, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F11', 6, 11, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'F12', 6, 12, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G1', 7, 1, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G2', 7, 2, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G3', 7, 3, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G4', 7, 4, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G5', 7, 5, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G6', 7, 6, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G7', 7, 7, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G8', 7, 8, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G9', 7, 9, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G10', 7, 10, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G11', 7, 11, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'G12', 7, 12, 'AVAILABLE', 'VIP', 1.2, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H1', 8, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H2', 8, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H3', 8, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H4', 8, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H5', 8, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H6', 8, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H7', 8, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H8', 8, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H9', 8, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H10', 8, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H11', 8, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'H12', 8, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I1', 9, 1, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I2', 9, 2, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I3', 9, 3, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I4', 9, 4, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I5', 9, 5, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I6', 9, 6, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I7', 9, 7, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I8', 9, 8, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I9', 9, 9, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I10', 9, 10, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I11', 9, 11, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'I12', 9, 12, 'AVAILABLE', 'STANDARD', 1.0, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J1', 10, 1, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J2', 10, 2, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J3', 10, 3, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J4', 10, 4, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J5', 10, 5, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J6', 10, 6, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J7', 10, 7, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J8', 10, 8, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J9', 10, 9, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J10', 10, 10, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J11', 10, 11, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 3'), 'J12', 10, 12, 'AVAILABLE', 'COUPLE', 1.8, false, false, true, NOW(), NOW());
-- VIP Cinema Room----------------------------------------------------------------------
INSERT INTO movietheater_seat (
    cinema_room_id, seat_number, seat_row, seat_column,
    seat_status, seat_type, price_multiplier,
    is_recliner, has_table, is_active,
    created_at, updated_at
) VALUES
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A1', 1, 1, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A2', 1, 2, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A3', 1, 3, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A4', 1, 4, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A5', 1, 5, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A6', 1, 6, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A7', 1, 7, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A8', 1, 8, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A9', 1, 9, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'A10', 1, 10, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B1', 2, 1, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B2', 2, 2, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B3', 2, 3, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B4', 2, 4, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B5', 2, 5, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B6', 2, 6, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B7', 2, 7, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B8', 2, 8, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B9', 2, 9, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'B10', 2, 10, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C1', 3, 1, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C2', 3, 2, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C3', 3, 3, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C4', 3, 4, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C5', 3, 5, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C6', 3, 6, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C7', 3, 7, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C8', 3, 8, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C9', 3, 9, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'C10', 3, 10, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D1', 4, 1, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D2', 4, 2, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D3', 4, 3, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D4', 4, 4, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D5', 4, 5, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D6', 4, 6, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D7', 4, 7, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D8', 4, 8, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D9', 4, 9, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'D10', 4, 10, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E1', 5, 1, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E2', 5, 2, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E3', 5, 3, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E4', 5, 4, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E5', 5, 5, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E6', 5, 6, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E7', 5, 7, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E8', 5, 8, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E9', 5, 9, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'E10', 5, 10, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F1', 6, 1, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F2', 6, 2, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F3', 6, 3, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F4', 6, 4, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F5', 6, 5, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F6', 6, 6, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F7', 6, 7, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F8', 6, 8, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F9', 6, 9, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW()),
      ( (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room'), 'F10', 6, 10, 'AVAILABLE', 'VIP', 1.8, true, true, true, NOW(), NOW());

-- Cập nhật seat_quantity trong cinema_room dựa trên số ghế thực tế
UPDATE movietheater_cinema_room cr
SET seat_quantity = (
    SELECT COUNT(*)
    FROM movietheater_seat s
    WHERE s.cinema_room_id = cr.cinema_room_id AND s.is_active = true
);

-- DATABASE SUCCESS MESSAGE
SELECT '🎬 Lumiere Cinema Database Initialized Successfully!' as status,
       'Admin: admin@lumierecinema.com / admin123' as admin_account,
       'Employee: employee@lumierecinema.com / employee123' as employee_account,
       CONCAT((SELECT COUNT(*) FROM movietheater_movie WHERE status = 'NOW_SHOWING'), ' movies NOW_SHOWING') as now_showing,
       CONCAT((SELECT COUNT(*) FROM movietheater_movie WHERE status = 'COMING_SOON'), ' movies COMING_SOON') as coming_soon,
       CONCAT((SELECT COUNT(*) FROM movietheater_cinema_room WHERE is_active = true), ' cinema rooms active') as rooms,
       CONCAT((SELECT COUNT(*) FROM movietheater_schedule WHERE is_active = true), ' schedules today (minimal for testing)') as schedules_today,
       'Ready for Auto-Schedule Testing!' as auto_schedule_status;

-- =============================================
-- KIỂM TRA VÀ TỐI ƯU HÓA CHO MYSQL
-- =============================================

-- Kiểm tra tổng số ghế được tạo
SELECT
    cr.cinema_room_name,
    cr.seat_quantity as expected_seats,
    COUNT(s.seat_id) as actual_seats,
    CASE
        WHEN cr.seat_quantity = COUNT(s.seat_id) THEN '✅ OK'
        ELSE '❌ MISMATCH'
        END as status
FROM movietheater_cinema_room cr
         LEFT JOIN movietheater_seat s ON cr.cinema_room_id = s.cinema_room_id
WHERE cr.is_active = true
GROUP BY cr.cinema_room_id, cr.cinema_room_name, cr.seat_quantity
ORDER BY cr.cinema_room_name;

-- Cập nhật lại seat_quantity dựa trên số ghế thực tế (đảm bảo đồng bộ)
UPDATE movietheater_cinema_room cr
SET seat_quantity = (
    SELECT COUNT(*)
    FROM movietheater_seat s
    WHERE s.cinema_room_id = cr.cinema_room_id AND s.is_active = true
)
WHERE cr.is_active = true;

-- Cập nhật available_seats trong schedule dựa trên số ghế thực tế
UPDATE movietheater_schedule sch
SET available_seats = (
    SELECT COUNT(*)
    FROM movietheater_seat s
    WHERE s.cinema_room_id = sch.cinema_room_id AND s.is_active = true
)
WHERE sch.is_active = true;

-- Tối ưu hóa performance: Thêm một số index bổ sung cho MySQL
CREATE INDEX IF NOT EXISTS idx_seat_room_status ON movietheater_seat(cinema_room_id, seat_status, is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_date_time ON movietheater_schedule(show_date, start_time, is_active);
CREATE INDEX IF NOT EXISTS idx_movie_status_active ON movietheater_movie(status, is_active);

-- Kiểm tra cuối cùng
SELECT
    '🎬 Database Optimization Complete!' as message,
    CONCAT('✅ ', (SELECT COUNT(*) FROM movietheater_seat WHERE is_active = true), ' seats created') as seats_status,
    CONCAT('✅ ', (SELECT COUNT(*) FROM movietheater_cinema_room WHERE is_active = true), ' rooms ready') as rooms_status,
    CONCAT('✅ ', (SELECT COUNT(*) FROM movietheater_movie WHERE status = 'NOW_SHOWING'), ' movies ready for auto-schedule') as movies_status,
    '🚀 System Ready!' as final_status; 

