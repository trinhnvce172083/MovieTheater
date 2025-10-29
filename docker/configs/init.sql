-- Movie Theater Database Initialization
-- Updated với phim thực tế từ tháng 10/2025 trở đi (ngày hiện tại: 19/10/2025)

-- Comment out for DBeaver execution (database already selected in connection)
-- CREATE DATABASE IF NOT EXISTS cinema_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- USE cinema_db;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Comment out GRANT (requires root privileges)
-- GRANT ALL PRIVILEGES ON cinema_db.* TO 'cinema_user'@'%';
-- FLUSH PRIVILEGES;

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
             '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- BCrypt hash cho "12345Aa!"
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
             '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- BCrypt hash cho "12345Aa!"
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
-- -- Employee 1: Trần Quang Thuận
-- INSERT INTO movietheater_account (username,
--                                   email,
--                                   password,
--                                   full_name,
--                                   phone_number,
--                                   role,
--                                   is_active,
--                                   is_verified,
--                                   email_verified,
--                                   membership_points,
--                                   membership_level,
--                                   created_at,
--                                   updated_at,
--                                   created_by)
-- VALUES ('thuan.tq',
--         'thuan.tq@lumierecinema.com',
--         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
--         'Trần Quang Thuận',
--         '0123456781',
--         'EMPLOYEE',
--         TRUE,
--         TRUE,
--         TRUE,
--         10000,
--         'PLATINUM',
--         NOW(),
--         NOW(),
--         'SYSTEM');

-- -- Employee 2: Lê Đức Anh
-- INSERT INTO movietheater_account (username,
--                                   email,
--                                   password,
--                                   full_name,
--                                   phone_number,
--                                   role,
--                                   is_active,
--                                   is_verified,
--                                   email_verified,
--                                   membership_points,
--                                   membership_level,
--                                   created_at,
--                                   updated_at,
--                                   created_by)
-- VALUES ('anh.ld',
--         'anh.ld@lumierecinema.com',
--         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
--         'Lê Đức Anh',
--         '0123456782',
--         'EMPLOYEE',
--         TRUE,
--         TRUE,
--         TRUE,
--         10000,
--         'PLATINUM',
--         NOW(),
--         NOW(),
--         'SYSTEM');

-- -- Employee 3: Ngô Việt Trinh
-- INSERT INTO movietheater_account (username,
--                                   email,
--                                   password,
--                                   full_name,
--                                   phone_number,
--                                   role,
--                                   is_active,
--                                   is_verified,
--                                   email_verified,
--                                   membership_points,
--                                   membership_level,
--                                   created_at,
--                                   updated_at,
--                                   created_by)
-- VALUES ('trinh.nv',
--         'trinh.nv@lumierecinema.com',
--         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
--         'Ngô Việt Trinh',
--         '0123456783',
--         'EMPLOYEE',
--         TRUE,
--         TRUE,
--         TRUE,
--         10000,
--         'PLATINUM',
--         NOW(),
--         NOW(),
--         'SYSTEM');

-- -- Employee 4: Nguyễn Tiến Dũng
-- INSERT INTO movietheater_account (username,
--                                   email,
--                                   password,
--                                   full_name,
--                                   phone_number,
--                                   role,
--                                   is_active,
--                                   is_verified,
--                                   email_verified,
--                                   membership_points,
--                                   membership_level,
--                                   created_at,
--                                   updated_at,
--                                   created_by)
-- VALUES ('dung.nt',
--         'dung.nt@lumierecinema.com',
--         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
--         'Nguyễn Tiến Dũng',
--         '0123456784',
--         'EMPLOYEE',
--         TRUE,
--         TRUE,
--         TRUE,
--         10000,
--         'PLATINUM',
--         NOW(),
--         NOW(),
--         'SYSTEM');

-- -- Employee 5: Phạm Thị Minh Ánh
-- INSERT INTO movietheater_account (username,
--                                   email,
--                                   password,
--                                   full_name,
--                                   phone_number,
--                                   role,
--                                   is_active,
--                                   is_verified,
--                                   email_verified,
--                                   membership_points,
--                                   membership_level,
--                                   created_at,
--                                   updated_at,
--                                   created_by)
-- VALUES ('minhanh.pt',
--         'minhanh.pt@lumierecinema.com',
--         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
--         'Phạm Thị Minh Ánh',
--         '0123456785',
--         'EMPLOYEE',
--         TRUE,
--         TRUE,
--         TRUE,
--         10000,
--         'PLATINUM',
--         NOW(),
--         NOW(),
--         'SYSTEM');

-- -- Employee 6: Lê Công Vinh
-- INSERT INTO movietheater_account (username,
--                                   email,
--                                   password,
--                                   full_name,
--                                   phone_number,
--                                   role,
--                                   is_active,
--                                   is_verified,
--                                   email_verified,
--                                   membership_points,
--                                   membership_level,
--                                   created_at,
--                                   updated_at,
--                                   created_by)
-- VALUES ('vinh.lc',
--         'vinh.lc@lumierecinema.com',
--         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa',
--         'Lê Công Vinh',
--         '0123456786',
--         'EMPLOYEE',
--         TRUE,
--         TRUE,
--         TRUE,
--         10000,
--         'PLATINUM',
--         NOW(),
--         NOW(),
--         'SYSTEM');

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
('Standard Room 2', 120, 'STANDARD', true, 'Phòng chiếu lớn với sức chứa tối đa', 10, 12, true, true, false, 1.0, false, false, false, NOW(), NOW()),
('Standard Room 3', 120, 'STANDARD', true, 'Phòng chiếu nhỏ gọn với thiết kế hiện đại', 10, 12, true, false, false, 1.0, false, false, false, NOW(), NOW()),

-- 1 phòng đặc biệt
('VIP Cinema Room', 60, 'VIP', true, 'Trải nghiệm VIP sang trọng với ghế massage và bàn ăn', 6, 10, true, true, true, 1.8, false, false, true, NOW(), NOW());


-- PHIM THỰC TẾ từ tháng 10/2025 trở đi
INSERT INTO movietheater_movie (
    title, original_title, description, duration, genres, director, cast, language, country,
    release_date, end_date, rating, poster_url, backdrop_url, trailer_url,
    is_active, is_featured, price, status, imdb_rating, production_company,
    auto_schedule_enabled, priority_score, min_daily_shows, max_daily_shows, preferred_room_types
) VALUES
-- NOW_SHOWING (đang chiếu tháng 10/2025)
('CỤC VÀNG CỦA NGOẠI', 'CỤC VÀNG CỦA NGOẠI', 'Cục Vàng Của Ngoại phim cảm động về tình bà cháu trong một xóm nhỏ đầy nghĩa tình. Bà Hậu – người phụ nữ tần tảo, trở thành chỗ dựa duy nhất cho đứa cháu khi con gái bỏ đi. Dù cuộc sống vất vả, bà vẫn dành trọn tình yêu thương cho cháu – cục vàng của đời mình. Bộ phim gợi lại những ký ức tuổi thơ ấm áp, với tình cảm gia đình, xóm giềng chan hòa và sự giản dị, chân thành của con người quê.', 119, 'Gia đình, Tâm Lý', 'Khương Ngọc', 'Việt Hương, Hồng Đào, Lê Khánh, Băng Di, Lâm Thanh Mỹ, Hữu Châu, Tuấn Khải, Thư Đan, Panda', 'Tiếng Việt - Phụ đề tiếng Anh', 'Việt Nam', '2025-10-17', '2026-01-03', 'T13', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/cucvangcuangoai.png', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/cucvangcuangoai.jpg', 'https://youtu.be/YPCtgD0KnGk', TRUE, TRUE, 150000, 'NOW_SHOWING', 7.5, 'Sony Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX,VIP'),

('GIÓ VẪN THỔI', 'GIÓ VẪN THỔI', 'The Wind Rises lấy bối cảnh Nhật Bản thời Taishō và Shōwa, kể về Jirō Horikoshi – chàng trai khao khát được bay dù bị cận thị. Được truyền cảm hứng từ nhà thiết kế Caproni, Jirō trở thành kỹ sư hàng không tài năng. Sau trận động đất Kantō, anh gặp và yêu Nahoko, nhưng hạnh phúc của họ bị thử thách khi cô mắc bệnh lao. Giữa lúc đất nước bước vào chiến tranh, Jirō phải đối mặt với mâu thuẫn giữa đam mê sáng tạo và hiện thực tàn khốc của thời cuộc.', 127, 'Hoạt Hình', 'Hayao Miyazaki', 'Hideaki Anno, Miori Takimoto, Hidetoshi Nishijima', 'Tiếng Nhật - Lồng tiếng/Phụ đề Tiếng Việt', 'Nhật Bản', '2025-10-17', '2026-01-17', 'R', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/poster_gio_van_thoi_1.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/giovanthoi.jpg', 'https://youtu.be/rp9VsYzVltw', TRUE, TRUE, 140000, 'NOW_SHOWING', 7.8, 'Paramount Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX'),

('NHÀ MA XÓ', 'NHÀ MA XÓ', 'Nhà Ma Xó xoay quanh câu chuyện về bà Hiền, người phụ nữ một mình nuôi 3 người con sau tai nạn chồng qua đời. Mọi chuyện bắt đầu khi người con trai giữa trong một lần thả lưới bắt cá vớt được một cái khạp bằng sành, nắp đậy kín. Từ đó, những hiện tượng kỳ quái liên tiếp xảy ra trong gia đình.', 108, 'Gia đình, Kinh Dị', 'Trương Dũng', 'Quang Tuấn, Huỳnh Đông, Vân Trang,Hoàng Kim Ngọc, Lan Thy, NS Thanh Hằng, Lâm Thanh Nhã, Vương Khang, Thạch Kim Long…', 'Tiếng Việt', 'Việt Nam', '2025-10-24', '2026-01-10', 'T16', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/nhamaxo.png', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/nhamaxo.png', 'https://youtu.be/iKFVjVJxv4Q?si=4-bCHU20xkTzuVoL', TRUE, TRUE, 130000, 'NOW_SHOWING', 8.2, 'DreamWorks Animation', TRUE, 8, 3, 4, 'STANDARD,4DX'),

('GOOD BOY – CHÓ CƯNG ĐỪNG SỢ', 'GOOD BOY – CHÓ CƯNG ĐỪNG SỢ', 'Phim kể về chú chó Indy, chuyển đến sống cùng chủ nhân Todd ở một ngôi nhà nông thôn. Indy sớm phát hiện ra những thế lực siêu nhiên ẩn nấp trong bóng tối và phải chiến đấu để bảo vệ người chủ yêu thương khi những thực thể hắc ám đe dọa Todd.', 73, 'Kinh Dị', 'Ben Leonberg', 'Indy, Shane Jensen, Arielle Friedman, Larry Fessenden,…', 'Tiêng Anh - Phụ đề Tiếng Việt', 'USA', '2025-10-24', '2026-01-11', 'T16', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/good_boy_-_payoff_poster_-_kc_24102025.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/goodboy.png', 'https://youtu.be/zaPcin5knJk?si=4NSWwNZdrp4WjWHu', TRUE, TRUE, 145000, 'NOW_SHOWING', 7.0, 'Cineverse', TRUE, 7, 2, 4, 'STANDARD'),

('TEE YOD: QUỶ ĂN TẠNG PHẦN 3', 'TEE YOD: QUỶ ĂN TẠNG PHẦN 3', 'Yak và gia đình phải đối mặt với nỗi kinh hoàng mới khi “Yee” – cô em út – đột ngột mất tích bí ẩn. Yak buộc phải cùng Yos, Yod và Papan lên đường đến “Bong Sa Noh Bian” – khu rừng ma ám – để cứu Yee trước khi những linh hồn tà ác một lần nữa bị đánh thức.', 104, 'Kinh Dị', 'Narit Yuvaboon', 'Nadech Kugimiya, Denise Jelilcha Kapaun, Mim Rattawadee Wongthong, Junior Kajbhunditt Jaidee, Friend Peerakrit Phacharaboonyakiat', 'Tiếng Thái - Phụ đề Tiếng Việt và Tiếng Anh', 'Thái Lan', '2025-10-10', '2026-01-04', 'T16', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/quyantang3%20(1).jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/quyantang3.jpg', 'https://youtu.be/DMOGnGokm4c', TRUE, TRUE, 160000, 'NOW_SHOWING', 8.5, 'Warner Bros. Pictures', TRUE, 10, 4, 6, 'STANDARD,IMAX,VIP'),

('TỔ QUỐC TRONG TIM: THE CONCERT FILM', 'TỔ QUỐC TRONG TIM: THE CONCERT FILM', 'Sau thành công rực rỡ của Concert Quốc gia – Tổ Quốc Trong Tim tổ chức ngày 10/8 tại SVĐ Quốc gia Mỹ Đình, cùng sự mong đợi và yêu cầu từ đông đảo công chúng, Báo Nhân Dân quyết định mang đến Tổ Quốc Trong Tim: The Concert Film. Bộ phim không chỉ tái hiện lại một sự kiện văn hóa – nghệ thuật lịch sử, mà còn là cách để lan tỏa sâu sắc tình yêu Tổ quốc và niềm tự hào dân tộc.', 120, 'Hòa nhạc, Phim tài liệu', 'Nguyễn Mạnh Tuấn - Vũ Liêm', 'Các nghệ sĩ Việt Nam', 'Tiếng Việt', 'Việt Nam', '2025-10-17', '2025-12-06', 'P', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/toquoc.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/toquoc.jpg', 'https://youtu.be/TOM9arDO1ok', TRUE, TRUE, 145000, 'NOW_SHOWING', 7.8, 'Warner Bros. Pictures', TRUE, 8, 3, 5, 'STANDARD,IMAX'),

-- COMING_SOON (sắp chiếu cuối tháng 10 và tháng 11/2025)
('ĐIỆN THOẠI ĐEN 2', 'ĐIỆN THOẠI ĐEN 2', 'Bốn năm sau khi thoát khỏi The Grabber, Finn vẫn bị ám ảnh, còn em gái Gwen bắt đầu mơ thấy những cuộc gọi kỳ lạ từ chiếc điện thoại đen. Khi cả hai tìm hiểu, họ phát hiện bí mật kinh hoàng về The Grabber và gia đình mình, buộc phải đối đầu với kẻ sát nhân đã chết nhưng còn đáng sợ hơn xưa.', 114, 'Hồi hộp, Kinh Dị', 'Scott Derrickson', 'Ethan Hawke, Mason Thames, Madeleine McGraw, Demián Bichir, Miguel Mora, Jeremy Davies, Arianna Rivas', 'Tiếng Anh - phụ đề Tiếng Việt', 'USA', '2025-10-31', '2026-02-15', 'PG-13', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/dienthoaiden.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/blackphone2poster2.jpg', 'https://youtu.be/Uo5sNWGrFQ8', TRUE, TRUE, 155000, 'COMING_SOON', 7.2, 'Amazon MGM Studios', TRUE, 8, 3, 5, 'STANDARD,IMAX'),

('PHÁ ĐÁM - SINH NHẬT MẸ', 'PHÁ ĐÁM - SINH NHẬT MẸ', 'Bị giang hồ đe doạ, một người con trai đã làm đám ma giả cho mẹ mình để lừa tiền bảo hiểm. Nhưng kế hoạch bất hiếu điên rồ của anh liên tục bị phá đám bởi từ người lạ đến người quen, nhất là khi ngày anh đưa mẹ vào hòm lại tình cờ là ngày sinh nhật 60 tuổi của bà.', 91, 'Gia đình, Hài, Kịch tính', 'Nguyễn Thanh Bình', 'Nghệ sĩ Ái Như, Thành Hội, Trần Kim Hải, Tín Nguyễn, Samuel An, Hồng Ánh, Bé Sam, Hoàng Phi, NSƯT Hữu Châu, Huy Khánh, Ngọc Sơn', 'Tiếng Việt', 'Việt Nam', '2025-10-31', '2026-02-22', 'R', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/snme.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/snme.png', 'https://youtu.be/nZVu2iogGu0', TRUE, TRUE, 170000, 'COMING_SOON', 8.6, 'Paramount Pictures', TRUE, 10, 4, 6, 'STANDARD,IMAX,VIP'),

('BỊT MẮT BẮT NAI', 'BỊT MẮT BẮT NAI', 'Trang - một nhân viên bất động sản bị cưỡng bức. Cô lo sợ bạn trai Hiệp sẽ chia tay nên đã “dụ” anh đến một homestay để cầu hôn. Tại đây, cô hoảng loạn khi gặp Long - chủ homestay, người giống hệt kẻ đã hãm hại mình; bên cạnh đó Ngọc - vợ của Long cũng là nạn nhân của tên này. Khi Trang âm thầm tìm hiểu sự thật, thì mọi thứ càng lại càng phức tạp hơn và có một âm mưu đen tối đang chờ đợi tất cả bọn họ.', 92, 'Hồi hộp, Tâm Lý', 'Hoàng Thơ', 'Lương Gia Huy, Thái Trà My, Dũng Bino, Bích Ngọc', 'Tiếng Việt - Phụ đề Tiếng Anh', 'Việt Nam', '2025-10-31', '2026-02-27', 'PG', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/matnai.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/bitmatbatnai_2.jpg', 'https://youtu.be/AVm6gVRaOQE', TRUE, TRUE, 165000, 'COMING_SOON', 8.4, 'Universal Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX,VIP'),

('GODZILLA MINUS ONE', 'GODZILLA MINUS ONE', 'Năm 1945, phi công Nhật Koichi Shikishima chạm trán Godzilla nhưng không thể tiêu diệt nó, mang theo nỗi tội lỗi suốt đời. Anh tìm thấy hy vọng bên Noriko và bé Akiko, nhưng nhiều năm sau, Godzilla — giờ nhiễm phóng xạ và mạnh mẽ hơn — trở lại, buộc Shikishima phải đối mặt với quá khứ và con quái vật từng ám ảnh mình.', 125, 'Hành Động, Khoa Học Viễn Tưởng, Phiêu Lưu', 'Takashi Yamazaki', 'Ryûnosuke Kamiki, Minami Hamabe, Yuki Yamada,...', 'Tiếng Nhật – Phụ đề Tiếng Việt & Tiếng Anh', 'Nhật Bản', '2025-11-7', '2026-02-27', 'PG', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/godzilla.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/godzilla-minus-one-banner.avif', 'https://youtu.be/ZctQf1MbyBQ', TRUE, TRUE, 140000, 'COMING_SOON', 8.0, 'Walt Disney Animation', TRUE, 9, 3, 5, 'STANDARD,IMAX,4DX'),

('CẢI MẢ', 'CẢI MẢ', 'Khi đại gia đình ông Quang trở về quê để thực hiện nghi lễ cải táng đã bị trì hoãn quá lâu, họ không chỉ đối diện với những nghi thức tâm linh, mà còn vô tình khơi dậy vòng xoáy nghiệp báo truyền đời.', 115, 'Kinh Dị', 'Thắng Vũ', 'Rima Thanh Vy, Hoàng Phúc, Thúy Hạnh, Avin Lu, Kim Hải, Lâm Thanh Nhã, Kiều Trinh, Hoàng Mèo, Kim Long,…', 'Tiếng Việt', 'Việt Nam', '2025-10-31', '2026-03-20', 'PG', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/caima.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/caima.png', 'https://youtu.be/KxvLXJqFCPY', TRUE, TRUE, 135000, 'COMING_SOON', 7.8, 'Paramount Pictures', TRUE, 8, 3, 5, 'STANDARD,4DX'),

('WICKED: PHẦN 2', 'WICKED: PHẦN 2', 'Wicked: Phần 2 là chương cuối đầy cảm xúc của hiện tượng điện ảnh toàn cầu. Sau khi chia cách, Elphaba bị coi là Phù thủy độc ác còn Glinda trở thành biểu tượng của Lòng tốt. Khi cô gái từ Kansas xuất hiện và làm đảo lộn xứ Oz, hai người buộc phải hợp sức đối mặt định mệnh, tìm lại sự thấu hiểu và quyết định liệu họ có thể thay đổi tương lai của xứ sở phép màu hay không.', 160, 'Nhạc kịch, Thần thoại', 'Jon M. Chu', 'Cynthia Erivo, Ariana Grande, Jonathan Bailey, Ethan Slater, Bowen Yang, Marissa Bode, with Michelle Yeoh and Jeff Goldblum', 'Tiếng Anh - phụ đề Tiếng Việt', 'USA', '2025-11-21', '2026-03-20', 'PG', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/wicked2.jpg', 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/wicked-2-750_1749194656682.jpg', 'https://youtu.be/lZ4_nMbdlFQ', TRUE, TRUE, 150000, 'COMING_SOON', 8.1, 'Walt Disney Pictures', TRUE, 9, 3, 5, 'STANDARD,IMAX,VIP');

-- MINIMAL SCHEDULES - CHỈ MẪU CHO HÔM NAY (19/10/2025)
SET @std_room1 = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 1' LIMIT 1);
SET @std_room2 = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Standard Room 2' LIMIT 1);
SET @vip_room = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room' LIMIT 1);

SET @venom_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Venom: The Last Dance' LIMIT 1);
SET @smile2_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Smile 2' LIMIT 1);
SET @joker2_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Joker: Folie à Deux' LIMIT 1);

-- Chỉ 3 lịch chiếu mẫu cho hôm nay để test auto-schedule
INSERT IGNORE INTO movietheater_schedule (
    movie_id, cinema_room_id, show_date, start_time, end_time, price,
    is_active, status, is_3d, is_imax, is_4dx, subtitle_language,
    audio_language, available_seats, booked_seats, auto_generated,
    time_slot_type, created_at, updated_at
) VALUES
(@venom_id, @std_room1, CURDATE(), '09:00:00', '10:49:00', 150000, true, 'SCHEDULED',
 false, false, false, 'Vietnamese', 'English', 120, 0, false, 'MORNING', NOW(), NOW()),
(@smile2_id, @std_room2, CURDATE(), '14:30:00', '16:37:00', 140000, true, 'SCHEDULED',
 false, false, false, 'Vietnamese', 'English', 120, 0, false, 'AFTERNOON', NOW(), NOW()),
(@joker2_id, @vip_room, CURDATE(), '21:00:00', '23:18:00', 288000, true, 'SCHEDULED',
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

-- PROMOTIONS MỚI - Tháng 10/2025
INSERT INTO movietheater_promotion (promotion_code, promotion_name, description, discount_type, discount_value,
                                    max_discount_amount, min_purchase_amount, start_date, end_date,
                                    max_usage_count, current_usage_count, max_usage_per_user, is_featured,
                                    banner_image_url, points_required, code_validity_hours, is_active,
                                    created_at, updated_at, created_by)
VALUES
-- Halloween 2025 Special Promotion
('HALLOWEEN25', 'Halloween Spooktacular 2025', 'Giảm 25% cho tất cả phim kinh dị - Đặc biệt Halloween!', 'PERCENTAGE', 25.0,
 80000, 120000, '2025-10-15', '2025-10-31',
 1500, 0, 3, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/hlw25.jpg',
 0, 48, TRUE,
 NOW(), NOW(), 'SYSTEM'),


-- Welcome New Customer
('WELCOME50K', 'Chào mừng khách hàng mới', 'Giảm 50,000 VNĐ cho đơn hàng đầu tiên', 'FIXED', 50000,
 50000, 150000, '2025-10-01', '2025-12-31',
 800, 0, 1, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/khachmoi.jpg',
 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Weekend Special
('WEEKEND30', 'Ưu đãi cuối tuần', 'Giảm 30% cho suất chiếu cuối tuần (Thứ 7, CN)', 'PERCENTAGE', 30.0,
 100000, 200000, '2025-10-01', '2025-12-31',
 500, 0, 2, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/cuoituan.jpg',
 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Student Promotion
('STUDENT20', 'Ưu đãi sinh viên', 'Giảm 20% cho sinh viên (có thẻ sinh viên)', 'PERCENTAGE', 20.0,
 40000, 80000, '2025-10-01', '2025-12-31',
 2000, 0, 3, FALSE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/sinhvien.jpg',
 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Early Bird Special
('EARLYBIRD', 'Suất chiếu sớm siêu rẻ', 'Giảm 35% cho suất chiếu trước 12h trưa', 'PERCENTAGE', 35.0,
 70000, 100000, '2025-10-01', '2025-12-31',
 1200, 0, 2, FALSE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/suatsom.jpg',
 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Group Booking
('GROUP4PLUS', 'Ưu đãi nhóm 4+', 'Giảm 100,000 VNĐ khi đặt từ 4 vé trở lên', 'FIXED', 100000,
 100000, 400000, '2025-10-01', '2025-12-31',
 300, 0, 1, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/4+.jpg',
 0, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Points Redemption Promotions
('POINTS100', 'Đổi 100 điểm', 'Đổi 100 điểm để giảm 30,000 VNĐ', 'POINTS', 30000,
 30000, 50000, '2025-10-01', '2025-12-31',
 500, 0, 5, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/doi30k.jpg',
 100, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

('POINTS200', 'Đổi 200 điểm', 'Đổi 200 điểm để giảm 70,000 VNĐ', 'POINTS', 70000,
 70000, 100000, '2025-10-01', '2025-12-31',
 400, 0, 5, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/doi70k.jpg',
 200, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

('POINTS300', 'Đổi 300 điểm', 'Đổi 300 điểm để giảm 110,000 VNĐ', 'POINTS', 110000,
 110000, 150000, '2025-10-01', '2025-12-31',
 300, 0, 5, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/doi110k.jpg',
 300, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

('POINTS500', 'Đổi 500 điểm', 'Đổi 500 điểm để giảm 180,000 VNĐ', 'POINTS', 180000,
 180000, 250000, '2025-10-01', '2025-12-31',
 200, 0, 5, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/doi180k.jpg',
 500, 24, TRUE,
 NOW(), NOW(), 'SYSTEM'),

-- Black Friday Early Bird
('BLACKFRI25', 'Black Friday Sớm', 'Giảm giá 40% - Đón Black Friday sớm!', 'PERCENTAGE', 40.0,
 120000, 200000, '2025-10-25', '2025-11-05',
 600, 0, 2, TRUE,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/promotion-images/blackfriday.jpg',
 0, 48, TRUE,
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
) NOT NULL, -- POPCORN, DRINKS, FOOD, COMBO
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

-- ĐỒ ĂN & NƯỚC UỐNG MỚI - Tháng 10/2025
INSERT INTO movietheater_concession (
    name, description, category, price, image_url, flavor, size,
    stock_quantity, is_available, is_active, display_order,
    created_at, updated_at
)
VALUES
-- =========================
-- POPCORN (Bắp rang)
-- =========================
('Bắp rang bơ Original (Lớn)', 'Bắp rang bơ truyền thống, thơm ngon, giòn tan - Size lớn', 'POPCORN', 50000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/lon.jpg', 'Original', 'L',
 150, TRUE, TRUE, 1, NOW(), NOW()),

('Bắp rang bơ Original (Vừa)', 'Bắp rang bơ thơm ngon, giòn rụm - Size vừa', 'POPCORN', 40000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/vua.jpg', 'Original', 'M',
 150, TRUE, TRUE, 2, NOW(), NOW()),

('Bắp rang bơ Original (Nhỏ)', 'Bắp rang bơ size nhỏ gọn, hoàn hảo cho 1 người', 'POPCORN', 30000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/nho.jpg', 'Original', 'S',
 180, TRUE, TRUE, 3, NOW(), NOW()),

('Bắp rang Phô mai (Lớn)', 'Bắp rang phủ phô mai đậm đà, béo ngậy - Size lớn', 'POPCORN', 55000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/phomailon.jpg', 'Cheese', 'L',
 120, TRUE, TRUE, 4, NOW(), NOW()),

('Bắp rang Phô mai (Vừa)', 'Bắp rang phô mai thơm béo hấp dẫn', 'POPCORN', 45000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/phomaivua.jpg', 'Cheese', 'M',
 100, TRUE, TRUE, 5, NOW(), NOW()),

('Bắp rang Caramel (Lớn)', 'Bắp rang caramel ngọt ngào, giòn tan - Size lớn', 'POPCORN', 60000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/caramellon.jpg', 'Caramel', 'L',
 80, TRUE, TRUE, 6, NOW(), NOW()),

('Bắp rang Caramel (Vừa)', 'Bắp rang Caramel ngọt dịu, giòn rụm', 'POPCORN', 50000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/caramelvua.jpg', 'Caramel', 'M',
 90, TRUE, TRUE, 7, NOW(), NOW()),

('Bắp rang Halloween Special', 'Bắp rang phô mai & caramel mix - Đặc biệt Halloween 2025!', 'POPCORN', 65000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/halloween.jpg', 'Mixed', 'L',
 50, TRUE, TRUE, 8, NOW(), NOW()),

-- =========================
-- DRINKS (Nước uống)
-- =========================
('Coca Cola (Lớn)', 'Nước ngọt Coca Cola mát lạnh - 700ml', 'DRINKS', 30000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/coca700.jpg', 'Cola', 'L',
 200, TRUE, TRUE, 9, NOW(), NOW()),

('Coca Cola (Vừa)', 'Nước ngọt Coca Cola - 500ml', 'DRINKS', 25000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/coca500.jpg', 'Cola', 'M',
 250, TRUE, TRUE, 10, NOW(), NOW()),

('Sprite (Lớn)', 'Nước ngọt Sprite chanh mát lạnh - 700ml', 'DRINKS', 30000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/spirte700.jpg', 'Lemon', 'L',
 180, TRUE, TRUE, 13, NOW(), NOW()),

('Sprite (Vừa)', 'Nước ngọt Sprite thanh mát - 500ml', 'DRINKS', 25000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/sprite500.jpg', 'Lemon', 'M',
 200, TRUE, TRUE, 14, NOW(), NOW()),

('Nước suối Aquafina', 'Nước suối tinh khiết 500ml', 'DRINKS', 15000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/aquafina.jpg', 'Plain', '500ml',
 300, TRUE, TRUE, 15, NOW(), NOW()),

('Trà xanh không độ', 'Trà xanh 0 độ mát lạnh - 450ml', 'DRINKS', 20000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/0do.jpg', 'Green Tea', '450ml',
 150, TRUE, TRUE, 16, NOW(), NOW()),

('7Up Mojito', 'Nước ngọt 7Up vị Mojito sảng khoái - 500ml', 'DRINKS', 28000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/7up.jpg', 'Mojito', '500ml',
 120, TRUE, TRUE, 17, NOW(), NOW()),

-- =========================
-- FOOD (Đồ ăn)
-- =========================
('Hot Dog Phô mai', 'Hot dog xúc xích Đức kèm phô mai cheddar tan chảy', 'FOOD', 45000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/hotdogpm.jpg', 'Cheese', 'Regular',
 80, TRUE, TRUE, 18, NOW(), NOW()),

('Hot Dog Bò BBQ', 'Hot dog xúc xích bò nướng BBQ đậm đà', 'FOOD', 50000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/hotdogbo.jpg', 'BBQ', 'Regular',
 70, TRUE, TRUE, 19, NOW(), NOW()),

('Nachos Phô mai', 'Nachos giòn rụm kèm sốt phô mai cheddar nóng hổi', 'FOOD', 55000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/nachos.jpg', 'Cheese', 'Regular',
 60, TRUE, TRUE, 20, NOW(), NOW()),

('Khoai tây chiên', 'Khoai tây chiên giòn vàng, thơm ngon', 'FOOD', 40000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/khoai.jpg', 'Original', 'Regular',
 100, TRUE, TRUE, 21, NOW(), NOW()),

('Gà popcorn giòn', '12 miếng gà popcorn giòn rụm, thơm phức', 'FOOD', 65000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/ga.jpg', 'Original', '12pcs',
 50, TRUE, TRUE, 22, NOW(), NOW()),

-- =========================
-- COMBO (Combo đặc biệt)
-- =========================
('💑 Combo Đôi Ngọt Ngào', '2 Bắp rang (M) + 2 Coca/Pepsi (M) - Hoàn hảo cho cặp đôi', 'COMBO', 140000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/combodoi.jpg', 'Mix', 'Combo',
 80, TRUE, TRUE, 23, NOW(), NOW()),

('👨‍👩‍👧‍👦 Combo Gia Đình', '2 Bắp rang (L) + 4 Nước ngọt (M) + 1 Nachos - Dành cho gia đình', 'COMBO', 250000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/combogiadinh.jpg', 'Family', 'Combo',
 50, TRUE, TRUE, 24, NOW(), NOW()),

('🎬 Combo Solo', '1 Bắp rang (M) + 1 Coca/Pepsi (M) - Tiết kiệm cho 1 người', 'COMBO', 65000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/combosolo.jpg', 'Solo', 'Combo',
 120, TRUE, TRUE, 25, NOW(), NOW()),

('🌟 Combo VIP', '1 Bắp rang Caramel (L) + 2 Nước ngọt (L) + 1 Hot Dog + 1 Khoai tây chiên', 'COMBO', 180000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/combovip.jpg', 'VIP', 'Combo',
 40, TRUE, TRUE, 26, NOW(), NOW()),

('🎃 Combo Halloween Special', '2 Bắp rang Halloween (L) + 2 Pepsi (L) + 1 Nachos - Ưu đãi đặc biệt!', 'COMBO', 220000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/combohlw.jpg', 'Halloween', 'Combo',
 30, TRUE, TRUE, 27, NOW(), NOW()),

('🍿 Combo Snack Đêm', '1 Bắp rang Phô mai (M) + 1 Hot Dog + 1 Sprite (M)', 'COMBO', 110000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/cobodem.jpg', 'Night', 'Combo',
 60, TRUE, TRUE, 28, NOW(), NOW()),

('👫 Combo Bạn Thân', '2 Bắp rang (M) + 2 Nước ngọt (M) + 1 Khoai tây chiên', 'COMBO', 160000,
 'https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/concession-images/combobanthan.jpg', 'Friends', 'Combo',
 70, TRUE, TRUE, 29, NOW(), NOW());
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

