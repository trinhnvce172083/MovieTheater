-- 🎬 Movie Theater Management System - Database Initialization
-- This file will be executed when MySQL container starts for the first time
-- Includes CREATE TABLE statements to ensure tables exist before INSERT

-- Set character set
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cinema_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE cinema_db;

-- Grant privileges to cinema_user
GRANT ALL PRIVILEGES ON cinema_db.* TO 'cinema_user'@'%';
FLUSH PRIVILEGES;

-- =============================================
-- CREATE TABLES (Khởi tạo Schema trước)
-- =============================================

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
    
    -- Member fields
    membership_points INT NOT NULL DEFAULT 0,
    membership_level VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    membership_expiry_date DATE,
    
    -- Employee fields
    employee_code VARCHAR(20),
    hire_date DATE,
    department VARCHAR(50),
    salary DECIMAL(15,2),
    manager_id BIGINT,
    
    -- Profile picture
    avatar_url VARCHAR(255),
    
    -- Password reset
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    
    -- Audit fields
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

-- Movie table
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
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_title (title),
    INDEX idx_release_date (release_date),
    INDEX idx_end_date (end_date),
    INDEX idx_active (is_active),
    INDEX idx_status (status),
    INDEX idx_genres (genres)
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
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_room_name (cinema_room_name),
    INDEX idx_room_type (room_type),
    INDEX idx_active (is_active)
);

-- Seat table
CREATE TABLE IF NOT EXISTS movietheater_seat (
    seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cinema_room_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_row INT NOT NULL,
    seat_column INT NOT NULL,
    seat_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    seat_type VARCHAR(20) DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    price_multiplier DOUBLE NOT NULL DEFAULT 1.0,
    is_recliner BOOLEAN NOT NULL DEFAULT FALSE,
    has_table BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    UNIQUE KEY unique_seat_position (cinema_room_id, seat_row, seat_column),
    INDEX idx_seat_status (seat_status),
    INDEX idx_seat_type (seat_type),
    INDEX idx_active (is_active),
    FOREIGN KEY (cinema_room_id) REFERENCES movietheater_cinema_room(cinema_room_id)
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
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_show_date (show_date),
    INDEX idx_start_time (start_time),
    INDEX idx_movie_room (movie_id, cinema_room_id),
    INDEX idx_active (is_active),
    INDEX idx_status (status),
    FOREIGN KEY (movie_id) REFERENCES movietheater_movie(movie_id),
    FOREIGN KEY (cinema_room_id) REFERENCES movietheater_cinema_room(cinema_room_id)
);

-- Promotion table
CREATE TABLE IF NOT EXISTS movietheater_promotion (
    promotion_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(20) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DOUBLE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    terms_and_conditions TEXT,
    max_usage_count INT,
    current_usage_count INT NOT NULL DEFAULT 0,
    max_usage_per_user INT,
    applicable_days VARCHAR(20),
    applicable_times VARCHAR(50),
    member_only BOOLEAN NOT NULL DEFAULT FALSE,
    membership_levels VARCHAR(100),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT DEFAULT 0,
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_dates (start_date, end_date),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured)
);

-- Booking table
CREATE TABLE IF NOT EXISTS movietheater_booking (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT,
    schedule_id BIGINT NOT NULL,
    promotion_id BIGINT,
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    booking_date DATETIME NOT NULL,
    total_amount DOUBLE NOT NULL,
    discount_amount DOUBLE DEFAULT 0.0,
    final_amount DOUBLE NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(20),
    payment_date DATETIME,
    payment_reference VARCHAR(100),
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(15),
    seat_count INT NOT NULL,
    notes TEXT,
    cancellation_date DATETIME,
    cancellation_reason TEXT,
    refund_amount DOUBLE,
    qr_code VARCHAR(255),
    is_checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    check_in_time DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    INDEX idx_booking_code (booking_code),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (booking_status),
    INDEX idx_customer_email (customer_email),
    FOREIGN KEY (account_id) REFERENCES movietheater_account(account_id),
    FOREIGN KEY (schedule_id) REFERENCES movietheater_schedule(schedule_id),
    FOREIGN KEY (promotion_id) REFERENCES movietheater_promotion(promotion_id)
);

-- Booking Seat junction table
CREATE TABLE IF NOT EXISTS movietheater_booking_seat (
    booking_seat_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    seat_price DOUBLE NOT NULL,
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    UNIQUE KEY unique_booking_seat (booking_id, seat_id),
    FOREIGN KEY (booking_id) REFERENCES movietheater_booking(booking_id),
    FOREIGN KEY (seat_id) REFERENCES movietheater_seat(seat_id)
);

-- =============================================
-- CONCESSION SYSTEM TABLES
-- =============================================

-- Concessions table (Food and Beverages)
CREATE TABLE IF NOT EXISTS concessions (
    concession_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    size VARCHAR(20),
    flavor VARCHAR(100),
    stock_quantity INT NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_available (is_available, is_active),
    INDEX idx_display_order (display_order)
);

-- Booking Concessions junction table
CREATE TABLE IF NOT EXISTS booking_concessions (
    booking_concession_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    concession_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES movietheater_booking(booking_id),
    FOREIGN KEY (concession_id) REFERENCES concessions(concession_id)
);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Admin Account (admin@lumiere.com / admin123)
-- Password hash for 'admin123' using BCrypt
INSERT IGNORE INTO movietheater_account (
    username, email, password, full_name, phone_number, 
    date_of_birth, address, role, is_active, is_verified, 
    email_verified, membership_points, membership_level,
    created_at, updated_at
) VALUES (
    'admin', 'admin@lumiere.com', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9tYoHA8t0r5lDvC',
    'System Administrator', '0901234567',
    '1985-01-01', '123 Admin Street, District 1, Ho Chi Minh City', 
    'ADMIN', true, true, true, 0, 'BRONZE',
    NOW(), NOW()
);

-- Employee Account (employee@lumiere.com / employee123)  
INSERT IGNORE INTO movietheater_account (
    username, email, password, full_name, phone_number,
    date_of_birth, address, role, is_active, is_verified,
    email_verified, employee_code, hire_date, department,
    created_at, updated_at
) VALUES (
    'employee', 'employee@lumiere.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9tYoHA8t0r5lDvC',
    'John Employee', '0901234568', 
    '1990-05-15', '456 Employee Street, District 3, Ho Chi Minh City',
    'EMPLOYEE', true, true, true, 'EMP001', '2024-01-01', 'Operations',
    NOW(), NOW()
);

-- Member Account (member@lumiere.com / member123)
INSERT IGNORE INTO movietheater_account (
    username, email, password, full_name, phone_number,
    date_of_birth, address, role, is_active, is_verified,
    email_verified, membership_points, membership_level,
    created_at, updated_at
) VALUES (
    'member', 'member@lumiere.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9tYoHA8t0r5lDvC',
    'Jane Member', '0901234569',
    '1995-08-20', '789 Member Street, District 7, Ho Chi Minh City',
    'MEMBER', true, true, true, 1250, 'SILVER',
    NOW(), NOW()
);

-- Customer Account (customer@lumiere.com / customer123)
INSERT IGNORE INTO movietheater_account (
    username, email, password, full_name, phone_number,
    date_of_birth, address, role, is_active, is_verified,
    email_verified, membership_points, membership_level,
    created_at, updated_at
) VALUES (
    'customer', 'customer@lumiere.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9tYoHA8t0r5lDvC',
    'Alice Customer', '0901234570',
    '1992-12-10', '321 Customer Street, District 2, Ho Chi Minh City',
    'CUSTOMER', true, true, true, 500, 'BRONZE',
    NOW(), NOW()
);

-- =============================================
-- CINEMA ROOMS
-- =============================================

INSERT IGNORE INTO movietheater_cinema_room (
    cinema_room_name, seat_quantity, room_type, is_active, description,
    row_count, column_count, has_3d, has_dolby_atmos, has_recliner_seats,
    price_multiplier, created_at, updated_at
) VALUES 
-- Standard Rooms
('Cinema Room A', 120, 'STANDARD', true, 'Standard cinema room with comfortable seating',
 10, 12, false, false, false, 1.0, NOW(), NOW()),
 
('Cinema Room B', 100, 'STANDARD', true, 'Cozy standard room perfect for all movie types',
 10, 10, false, true, false, 1.0, NOW(), NOW()),

-- VIP Rooms  
('VIP Cinema Room', 60, 'VIP', true, 'Luxury VIP experience with recliner seats and premium service',
 6, 10, true, true, true, 1.8, NOW(), NOW()),

-- IMAX Room
('IMAX Theater', 200, 'IMAX', true, 'Massive IMAX screen with premium sound system',
 15, 14, true, true, false, 2.2, NOW(), NOW()),

-- 4DX Room
('4DX Experience', 80, '4DX', true, 'Immersive 4DX experience with motion seats',
 8, 10, true, true, true, 2.5, NOW(), NOW());

-- =============================================
-- SAMPLE MOVIES
-- =============================================

INSERT IGNORE INTO movietheater_movie (
    title, original_title, description, duration, genres, director, cast,
    language, country, release_date, end_date, rating, poster_url, 
    backdrop_url, trailer_url, is_active, base_price, created_at, updated_at
) VALUES 
('Avengers: Endgame', 'Avengers: Endgame', 
 'The epic conclusion to the Infinity Saga. After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance to the universe.',
 181, 'Action,Adventure,Sci-Fi', 'Anthony Russo, Joe Russo',
 'Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson',
 'English', 'USA', '2024-01-15', '2024-12-31', 'PG-13', 
 '/posters/avengers-endgame.jpg', '/backdrops/avengers-endgame.jpg', 
 'https://www.youtube.com/watch?v=TcMBFSGVi1c', true, 120000, NOW(), NOW()),

('Spider-Man: No Way Home', 'Spider-Man: No Way Home',
 'With Spider-Mans identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
 148, 'Action,Adventure,Sci-Fi', 'Jon Watts',
 'Tom Holland, Zendaya, Benedict Cumberbatch, Jacob Batalon, Jon Favreau',
 'English', 'USA', '2024-02-01', '2024-11-30', 'PG-13',
 '/posters/spiderman-nwh.jpg', '/backdrops/spiderman-nwh.jpg',
 'https://www.youtube.com/watch?v=JfVOs4VSpmA', true, 110000, NOW(), NOW()),

('Top Gun: Maverick', 'Top Gun: Maverick',
 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUNs elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.',
 131, 'Action,Drama,Thriller', 'Joseph Kosinski',
 'Tom Cruise, Miles Teller, Jennifer Connelly, Jon Hamm, Glen Powell',
 'English', 'USA', '2024-03-01', '2024-10-31', 'PG-13',
 '/posters/top-gun-maverick.jpg', '/backdrops/top-gun-maverick.jpg',
 'https://www.youtube.com/watch?v=qSqVVswa420', true, 115000, NOW(), NOW()),

('Everything Everywhere All at Once', 'Everything Everywhere All at Once',
 'A bagel shop owner discovers she must save the world by exploring other universes where she could have made different choices and lived a completely different life.',
 139, 'Action,Adventure,Comedy,Drama,Sci-Fi', 'Daniels',
 'Michelle Yeoh, Stephanie Hsu, Ke Huy Quan, Jamie Lee Curtis, James Hong',
 'English', 'USA', '2024-04-01', '2024-09-30', 'R',
 '/posters/eeaao.jpg', '/backdrops/eeaao.jpg',
 'https://www.youtube.com/watch?v=WLVZfqE4TQ8', true, 105000, NOW(), NOW()),

('Avatar: The Way of Water', 'Avatar: The Way of Water',
 'Jake Sully lives with his newfound family formed on the planet of Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Navi race to protect their planet.',
 192, 'Action,Adventure,Drama,Sci-Fi', 'James Cameron',
 'Sam Worthington, Zoe Saldana, Sigourney Weaver, Stephen Lang, Kate Winslet',
 'English', 'USA', '2024-05-01', '2024-12-31', 'PG-13',
 '/posters/avatar-2.jpg', '/backdrops/avatar-2.jpg',
 'https://www.youtube.com/watch?v=d9MyW72ELq0', true, 130000, NOW(), NOW());

-- =============================================
-- MOVIE SCHEDULES
-- =============================================

-- Get cinema room IDs for schedule creation
SET @room1 = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Cinema Room A' LIMIT 1);
SET @room2 = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Cinema Room B' LIMIT 1);
SET @vip_room = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room' LIMIT 1);
SET @imax_room = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'IMAX Theater' LIMIT 1);
SET @4dx_room = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = '4DX Experience' LIMIT 1);

-- Get movie IDs
SET @avengers_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Avengers: Endgame' LIMIT 1);
SET @spiderman_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Spider-Man: No Way Home' LIMIT 1);
SET @topgun_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Top Gun: Maverick' LIMIT 1);
SET @eeaao_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Everything Everywhere All at Once' LIMIT 1);
SET @avatar_id = (SELECT movie_id FROM movietheater_movie WHERE title = 'Avatar: The Way of Water' LIMIT 1);

-- Today's schedules
INSERT IGNORE INTO movietheater_schedule (
    movie_id, cinema_room_id, show_date, start_time, end_time, price,
    is_active, status, is_3d, is_imax, is_4dx, subtitle_language,
    audio_language, available_seats, booked_seats, created_at, updated_at
) VALUES 
-- Standard Room schedules
(@avengers_id, @room1, CURDATE(), '09:00:00', '12:01:00', 120000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 120, 0, NOW(), NOW()),
(@spiderman_id, @room1, CURDATE(), '14:30:00', '16:58:00', 110000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 120, 0, NOW(), NOW()),
(@topgun_id, @room1, CURDATE(), '19:30:00', '21:41:00', 115000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 120, 0, NOW(), NOW()),

(@eeaao_id, @room2, CURDATE(), '10:15:00', '12:34:00', 105000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 100, 0, NOW(), NOW()),
(@avatar_id, @room2, CURDATE(), '15:00:00', '18:12:00', 130000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 100, 0, NOW(), NOW()),
(@avengers_id, @room2, CURDATE(), '20:45:00', '23:46:00', 120000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 100, 0, NOW(), NOW()),

-- VIP Room schedules (higher prices)
(@avatar_id, @vip_room, CURDATE(), '11:00:00', '14:12:00', 234000, true, 'SCHEDULED', true, false, false, 'Vietnamese', 'English', 60, 0, NOW(), NOW()),
(@topgun_id, @vip_room, CURDATE(), '16:30:00', '18:41:00', 207000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 60, 0, NOW(), NOW()),
(@spiderman_id, @vip_room, CURDATE(), '21:00:00', '23:28:00', 198000, true, 'SCHEDULED', true, false, false, 'Vietnamese', 'English', 60, 0, NOW(), NOW()),

-- IMAX schedules (premium pricing)
(@avengers_id, @imax_room, CURDATE(), '10:30:00', '13:31:00', 264000, true, 'SCHEDULED', true, true, false, 'Vietnamese', 'English', 200, 0, NOW(), NOW()),
(@avatar_id, @imax_room, CURDATE(), '17:00:00', '20:12:00', 286000, true, 'SCHEDULED', true, true, false, 'Vietnamese', 'English', 200, 0, NOW(), NOW()),

-- 4DX schedules (premium experience)
(@spiderman_id, @4dx_room, CURDATE(), '13:00:00', '15:28:00', 275000, true, 'SCHEDULED', true, false, true, 'Vietnamese', 'English', 80, 0, NOW(), NOW()),
(@topgun_id, @4dx_room, CURDATE(), '18:15:00', '20:26:00', 287500, true, 'SCHEDULED', true, false, true, 'Vietnamese', 'English', 80, 0, NOW(), NOW());

-- Tomorrow's schedules
INSERT IGNORE INTO movietheater_schedule (
    movie_id, cinema_room_id, show_date, start_time, end_time, price,
    is_active, status, is_3d, is_imax, is_4dx, subtitle_language,
    audio_language, available_seats, booked_seats, created_at, updated_at
) VALUES 
(@avengers_id, @room1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00', '12:31:00', 120000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 120, 0, NOW(), NOW()),
(@eeaao_id, @room1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00', '17:19:00', 105000, true, 'SCHEDULED', false, false, false, 'Vietnamese', 'English', 120, 0, NOW(), NOW()),
(@avatar_id, @imax_room, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', '23:12:00', 286000, true, 'SCHEDULED', true, true, false, 'Vietnamese', 'English', 200, 0, NOW(), NOW());

-- =============================================
-- SAMPLE PROMOTIONS
-- =============================================

INSERT IGNORE INTO movietheater_promotion (
    title, description, promotion_type, discount_type, discount_value,
    start_date, end_date, is_active, terms_and_conditions,
    max_usage_count, current_usage_count, max_usage_per_user,
    applicable_days, applicable_times, member_only, membership_levels,
    is_featured, display_order, created_at, updated_at
) VALUES 
('Weekend Special', 
 'Get 20% off on all weekend movie tickets! Perfect for family time and date nights.',
 'PERCENTAGE', 'PERCENTAGE', 20.00,
 '2024-01-01', '2024-12-31', true,
 'Valid only on Saturday and Sunday. Cannot be combined with other offers. Valid for all movies and showtimes.',
 1000, 0, 5, 'WEEKENDS', 'ALL', false, null, true, 1, NOW(), NOW()),

('Student Discount',
 'Students save 15% on all movie tickets with valid student ID.',
 'PERCENTAGE', 'PERCENTAGE', 15.00,
 '2024-01-01', '2024-12-31', true,
 'Valid student ID required. Applicable for all showtimes. Cannot be combined with member discounts.',
 null, 0, 10, 'ALL', 'ALL', false, null, true, 2, NOW(), NOW()),

('Happy Hour Matinee',
 'Special pricing for morning shows before 12 PM - only 80,000 VND!',
 'FIXED_AMOUNT', 'FIXED_PRICE', 80000.00,
 '2024-01-01', '2024-12-31', true,
 'Valid for shows starting before 12:00 PM on weekdays only. Standard and VIP rooms only.',
 null, 0, 3, 'WEEKDAYS', 'MORNING', false, null, true, 3, NOW(), NOW()),

('VIP Member Exclusive',
 'Gold and Platinum members get 25% off on all VIP and IMAX experiences.',
 'PERCENTAGE', 'PERCENTAGE', 25.00,
 '2024-01-01', '2024-12-31', true,
 'Valid for Gold and Platinum members only. Applicable for VIP, IMAX, and 4DX rooms.',
 null, 0, 2, 'ALL', 'ALL', true, 'GOLD,PLATINUM', true, 4, NOW(), NOW()),

('Couple Night Special',
 'Buy 2 tickets, get 1 free popcorn combo! Perfect for date nights.',
 'BUY_X_GET_Y', 'PERCENTAGE', 0.00,
 '2024-01-01', '2024-12-31', true,
 'Buy any 2 movie tickets and receive 1 medium popcorn combo free. Valid after 6 PM only.',
 500, 0, 1, 'ALL', 'EVENING', false, null, true, 5, NOW(), NOW());

-- =============================================
-- SEAT GENERATION FOR CINEMA ROOMS
-- =============================================

-- Create seats for Cinema Room A (10 rows x 12 columns = 120 seats)
SET @room_a_id = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'Cinema Room A' LIMIT 1);

INSERT IGNORE INTO movietheater_seat (
    cinema_room_id, seat_number, seat_row, seat_column, seat_status, 
    seat_type, is_active, price_multiplier, is_recliner, has_table, created_at, updated_at
)
SELECT 
    @room_a_id,
    CONCAT(CHAR(64 + r.row_num), c.col_num) as seat_number,
    r.row_num,
    c.col_num,
    'AVAILABLE',
    CASE 
        WHEN r.row_num <= 2 THEN 'VIP'  -- First 2 rows are VIP
        ELSE 'STANDARD'
    END,
    true,
    CASE 
        WHEN r.row_num <= 2 THEN 1.5  -- VIP seats 50% markup
        ELSE 1.0
    END,
    CASE 
        WHEN r.row_num <= 2 THEN true  -- VIP seats have recliners
        ELSE false
    END,
    false,
    NOW(),
    NOW()
FROM 
    (SELECT 1 as row_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) r
CROSS JOIN
    (SELECT 1 as col_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
     UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) c;

-- Create seats for VIP Cinema Room (6 rows x 10 columns = 60 seats, all VIP)
SET @vip_room_id = (SELECT cinema_room_id FROM movietheater_cinema_room WHERE cinema_room_name = 'VIP Cinema Room' LIMIT 1);

INSERT IGNORE INTO movietheater_seat (
    cinema_room_id, seat_number, seat_row, seat_column, seat_status, 
    seat_type, is_active, price_multiplier, is_recliner, has_table, created_at, updated_at
)
SELECT 
    @vip_room_id,
    CONCAT(CHAR(64 + r.row_num), c.col_num) as seat_number,
    r.row_num,
    c.col_num,
    'AVAILABLE',
    'VIP',
    true,
    1.0, -- Already factored into room price multiplier
    true,
    true, -- VIP seats have tables
    NOW(),
    NOW()
FROM 
    (SELECT 1 as row_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) r
CROSS JOIN
    (SELECT 1 as col_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) c;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT '🎬 Lumiere Cinema Database initialized successfully!' as message,
       'Schema: All tables created with complete structure' as schema_status,
       'Admin Account: admin@lumiere.com / admin123' as admin_login,
       'Employee Account: employee@lumiere.com / employee123' as employee_login,
       'Member Account: member@lumiere.com / member123' as member_login,
       'Customer Account: customer@lumiere.com / customer123' as customer_login,
       CONCAT(COUNT(*), ' sample movies loaded') as movies_count
FROM movietheater_movie WHERE is_active = true; 