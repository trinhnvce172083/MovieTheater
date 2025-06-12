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
    base_price DOUBLE NOT NULL,
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

-- ADMIN ACCOUNTS
INSERT IGNORE INTO movietheater_account (
    username, email, password, full_name, phone_number, date_of_birth, address, role, 
    is_active, is_verified, email_verified, membership_points, membership_level, created_at, updated_at
) VALUES 
('admin', 'admin@lumierecinema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'System Administrator', '0901234567', '1990-01-01', '123 Admin Street, District 1, Ho Chi Minh City',
 'ADMIN', true, true, true, 0, 'PLATINUM', NOW(), NOW()),
('employee', 'employee@lumierecinema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Cinema Employee', '0901234568', '1992-05-15', '456 Employee Avenue, District 3, Ho Chi Minh City',
 'EMPLOYEE', true, true, true, 0, 'GOLD', NOW(), NOW());

-- CINEMA ROOMS (11 phòng)
INSERT IGNORE INTO movietheater_cinema_room (
    cinema_room_name, seat_quantity, room_type, is_active, description, row_count, column_count, 
    has_3d, has_dolby_atmos, has_recliner_seats, price_multiplier, is_imax, is_4dx, is_vip, created_at, updated_at
) VALUES 
('Standard Room 1', 120, 'STANDARD', true, 'Phòng chiếu tiêu chuẩn với ghế thoải mái', 10, 12, false, false, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 2', 120, 'STANDARD', true, 'Phòng chiếu tiêu chuẩn với hệ thống âm thanh tốt', 10, 12, false, true, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 3', 100, 'STANDARD', true, 'Phòng chiếu nhỏ gọn', 10, 10, false, false, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 4', 140, 'STANDARD', true, 'Phòng chiếu lớn với sức chứa tối đa', 14, 10, false, true, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 5', 110, 'STANDARD', true, 'Phòng chiếu tiêu chuẩn với thiết kế hiện đại', 11, 10, true, false, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 6', 130, 'STANDARD', true, 'Phòng chiếu rộng rãi', 13, 10, true, true, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 7', 115, 'STANDARD', true, 'Phòng chiếu với màn hình lớn', 11, 10, false, true, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 8', 125, 'STANDARD', true, 'Phòng chiếu premium', 12, 10, true, true, false, 1.0, false, false, false, NOW(), NOW()),
('VIP Cinema Room', 60, 'VIP', true, 'Trải nghiệm VIP sang trọng', 6, 10, true, true, true, 1.8, false, false, true, NOW(), NOW()),
('IMAX Theater', 200, 'IMAX', true, 'Rạp IMAX với màn hình khổng lồ', 15, 14, true, true, false, 2.2, true, false, false, NOW(), NOW()),
('4DX Experience', 80, '4DX', true, 'Trải nghiệm 4DX đầy cảm xúc', 8, 10, true, true, true, 2.5, false, true, false, NOW(), NOW());

-- REAL MOVIES từ tháng 6/2025 trở đi
INSERT INTO movietheater_movie (
    title, original_title, description, duration, genres, director, cast, language, country,
    release_date, end_date, rating, poster_url, backdrop_url, trailer_url, 
    is_active, is_featured, base_price, status, imdb_rating, production_company,
    auto_schedule_enabled, priority_score, min_daily_shows, max_daily_shows, preferred_room_types
) VALUES 
-- NOW_SHOWING (đang chiếu từ 6/2025)
('From the World of John Wick: Ballerina', 'Ballerina', 'Ana de Armas trong vai nữ sát thủ báo thù trong vũ trụ John Wick.', 109, 'Action, Thriller', 'Len Wiseman', 'Ana de Armas, Keanu Reeves, Norman Reedus', 'English', 'USA', '2025-06-06', '2025-09-06', 'R', 'https://image.tmdb.org/t/p/w500/ballerina2025.jpg', 'https://image.tmdb.org/t/p/w1920/ballerina_backdrop.jpg', 'https://www.youtube.com/watch?v=ballerina_trailer', TRUE, TRUE, 150000, 'NOW_SHOWING', 7.8, 'Lionsgate Films', TRUE, 9, 3, 5, 'STANDARD,IMAX,VIP'),

('How to Train Your Dragon', 'How to Train Your Dragon (Live-Action)', 'Phiên bản live-action về chàng trai Viking kết bạn với rồng.', 104, 'Adventure, Family, Fantasy', 'Dean DeBlois', 'Mason Thames, Nico Parker, Gerard Butler', 'English', 'USA', '2025-06-13', '2025-09-13', 'PG', 'https://image.tmdb.org/t/p/w500/httyd2025.jpg', 'https://image.tmdb.org/t/p/w1920/httyd_backdrop.jpg', 'https://www.youtube.com/watch?v=httyd_trailer', TRUE, TRUE, 140000, 'NOW_SHOWING', 7.2, 'Universal Pictures', TRUE, 8, 3, 5, 'STANDARD,IMAX,4DX'),

('Materialists', 'Materialists', 'Cô gái mai mối ở New York bị kẹt giữa tình yêu hoàn hảo và người yêu cũ.', 115, 'Comedy, Romance', 'Celine Song', 'Dakota Johnson, Chris Evans, Pedro Pascal', 'English', 'USA', '2025-06-13', '2025-09-13', 'R', 'https://image.tmdb.org/t/p/w500/materialists2025.jpg', 'https://image.tmdb.org/t/p/w1920/materialists_backdrop.jpg', 'https://www.youtube.com/watch?v=materialists_trailer', TRUE, TRUE, 130000, 'NOW_SHOWING', 6.9, 'A24', TRUE, 7, 2, 4, 'STANDARD,VIP'),

('28 Years Later', '28 Years Later', 'Virus rage trở lại tàn phá nhân loại trong phần tiếp theo 28 Weeks Later.', 118, 'Horror, Thriller', 'Danny Boyle', 'Jodie Comer, Aaron Taylor-Johnson, Cillian Murphy', 'English', 'UK', '2025-06-20', '2025-09-20', 'R', 'https://image.tmdb.org/t/p/w500/28yearslater.jpg', 'https://image.tmdb.org/t/p/w1920/28years_backdrop.jpg', 'https://www.youtube.com/watch?v=28years_trailer', TRUE, TRUE, 160000, 'NOW_SHOWING', 8.1, 'Sony Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX'),

('Elio', 'Elio', 'Cậu bé được đưa qua thiên hà và nhầm làm đại sứ cho hành tinh Trái Đất.', 101, 'Animation, Adventure, Family', 'Adrian Molina', 'Yonas Kibreab, America Ferrera, Zoe Saldana', 'English', 'USA', '2025-06-20', '2025-09-20', 'PG', 'https://image.tmdb.org/t/p/w500/elio2025.jpg', 'https://image.tmdb.org/t/p/w1920/elio_backdrop.jpg', 'https://www.youtube.com/watch?v=elio_trailer', TRUE, TRUE, 120000, 'NOW_SHOWING', 7.5, 'Pixar Animation Studios', TRUE, 8, 3, 4, 'STANDARD,4DX'),

('Mission: Impossible - The Final Reckoning', 'Mission: Impossible - The Final Reckoning', 'Ethan Hunt đối mặt nhiệm vụ nguy hiểm nhất trong phần kết của series.', 163, 'Action, Adventure, Thriller', 'Christopher McQuarrie', 'Tom Cruise, Hayley Atwell, Ving Rhames', 'English', 'USA', '2025-05-23', '2025-09-23', 'PG-13', 'https://image.tmdb.org/t/p/w500/mifinal.jpg', 'https://image.tmdb.org/t/p/w1920/mi_backdrop.jpg', 'https://www.youtube.com/watch?v=mi_trailer', TRUE, TRUE, 180000, 'NOW_SHOWING', 8.7, 'Paramount Pictures', TRUE, 10, 3, 5, 'STANDARD,IMAX'),

-- COMING_SOON (sắp chiếu)
('F1: The Movie', 'F1', 'Tay đua F1 nghỉ hưu trở lại hướng dẫn tay đua trẻ.', 155, 'Action, Drama, Sport', 'Joseph Kosinski', 'Brad Pitt, Damson Idris, Javier Bardem', 'English', 'USA', '2025-06-27', '2025-10-27', 'PG-13', 'https://image.tmdb.org/t/p/w500/f1movie2025.jpg', 'https://image.tmdb.org/t/p/w1920/f1_backdrop.jpg', 'https://www.youtube.com/watch?v=f1_trailer', TRUE, TRUE, 180000, 'COMING_SOON', 8.3, 'Warner Bros. Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX'),

('M3GAN 2.0', 'M3GAN 2.0', 'M3GAN trở lại với nâng cấp chết người.', 119, 'Horror, Science Fiction', 'Gerard Johnstone', 'Allison Williams, Violet McGraw, Jemaine Clement', 'English', 'USA', '2025-06-27', '2025-10-27', 'PG-13', 'https://image.tmdb.org/t/p/w500/megan2.jpg', 'https://image.tmdb.org/t/p/w1920/megan2_backdrop.jpg', 'https://www.youtube.com/watch?v=megan2_trailer', TRUE, TRUE, 150000, 'COMING_SOON', 7.4, 'Universal Pictures', TRUE, 8, 3, 5, 'STANDARD,IMAX'),

('Jurassic World: Rebirth', 'Jurassic World: Rebirth', 'Nhiệm vụ khai thác DNA khủng long cho nghiên cứu y học.', 134, 'Action, Adventure, Science Fiction', 'Gareth Edwards', 'Scarlett Johansson, Jonathan Bailey, Mahershala Ali', 'English', 'USA', '2025-07-02', '2025-11-02', 'PG-13', 'https://image.tmdb.org/t/p/w500/jwrebirth.jpg', 'https://image.tmdb.org/t/p/w1920/jw_backdrop.jpg', 'https://www.youtube.com/watch?v=jw_trailer', TRUE, TRUE, 170000, 'COMING_SOON', 8.0, 'Universal Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX,4DX'),

('Superman', 'Superman', 'Man of Steel trở lại trong bản khởi động lại epic.', 129, 'Action, Adventure, Science Fiction', 'James Gunn', 'David Corenswet, Rachel Brosnahan, Nicholas Hoult', 'English', 'USA', '2025-07-11', '2025-11-11', 'PG-13', 'https://image.tmdb.org/t/p/w500/superman2025.jpg', 'https://image.tmdb.org/t/p/w1920/superman_backdrop.jpg', 'https://www.youtube.com/watch?v=superman_trailer', TRUE, TRUE, 180000, 'COMING_SOON', 8.5, 'DC Studios', TRUE, 10, 4, 6, 'STANDARD,IMAX'),

('I Know What You Did Last Summer', 'I Know What You Did Last Summer', 'Thế hệ mới đối mặt hậu quả của bí mật đen tối.', 108, 'Horror, Thriller', 'Jennifer Kaytin Robinson', 'Madelyn Cline, Chase Sui Wonders, Jonah Hauer-King', 'English', 'USA', '2025-07-18', '2025-10-18', 'R', 'https://image.tmdb.org/t/p/w500/ikwydls2025.jpg', 'https://image.tmdb.org/t/p/w1920/ikwydls_backdrop.jpg', 'https://www.youtube.com/watch?v=ikwydls_trailer', TRUE, TRUE, 140000, 'COMING_SOON', 6.8, 'Sony Pictures', TRUE, 7, 2, 4, 'STANDARD,IMAX'),

('The Fantastic Four: First Steps', 'The Fantastic Four: First Steps', 'Gia đình đầu tiên của Marvel trở lại chống Galactus.', 130, 'Action, Adventure, Science Fiction', 'Matt Shakman', 'Pedro Pascal, Vanessa Kirby, Joseph Quinn', 'English', 'USA', '2025-07-25', '2025-11-25', 'PG-13', 'https://image.tmdb.org/t/p/w500/fantastic4_2025.jpg', 'https://image.tmdb.org/t/p/w1920/ff_backdrop.jpg', 'https://www.youtube.com/watch?v=ff_trailer', TRUE, TRUE, 170000, 'COMING_SOON', 8.2, 'Marvel Studios', TRUE, 9, 3, 5, 'STANDARD,IMAX');

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
 false, false, false, 'Vietnamese', 'English', 120, 0, false, 'AFTERNOON', NOW(), NOW()),
(@materialists_id, @vip_room, CURDATE(), '21:00:00', '22:55:00', 234000, true, 'SCHEDULED', 
 false, false, false, 'Vietnamese', 'English', 60, 0, false, 'EVENING', NOW(), NOW());

-- DATABASE SUCCESS MESSAGE
SELECT '🎬 Lumiere Cinema Database Initialized Successfully!' as status,
       'Admin: admin@lumierecinema.com / admin123' as admin_account,
       'Employee: employee@lumierecinema.com / employee123' as employee_account,
       CONCAT((SELECT COUNT(*) FROM movietheater_movie WHERE status = 'NOW_SHOWING'), ' movies NOW_SHOWING') as now_showing,
       CONCAT((SELECT COUNT(*) FROM movietheater_movie WHERE status = 'COMING_SOON'), ' movies COMING_SOON') as coming_soon,
       CONCAT((SELECT COUNT(*) FROM movietheater_cinema_room WHERE is_active = true), ' cinema rooms active') as rooms,
       CONCAT((SELECT COUNT(*) FROM movietheater_schedule WHERE is_active = true), ' schedules today (minimal for testing)') as schedules_today,
       'Ready for Auto-Schedule Testing!' as auto_schedule_status; 