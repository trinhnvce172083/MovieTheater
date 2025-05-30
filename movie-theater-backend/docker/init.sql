-- 🎬 Movie Theater Management System - Database Initialization
-- This file will be executed when MySQL container starts for the first time

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

-- Insert sample roles (if roles table exists)
-- Note: Tables will be created by Hibernate DDL, so we use INSERT IGNORE

-- Sample Cinema Rooms
INSERT IGNORE INTO movietheater_cinema_room (cinema_room_id, cinema_room_name, seat_quantity) VALUES
(1, 'Cinema Room A', 100),
(2, 'Cinema Room B', 80),
(3, 'Cinema Room C', 120),
(4, 'VIP Cinema Room', 50);

-- Sample Movie Types
INSERT IGNORE INTO movietheater_type (type_id, type_name) VALUES
(1, 'Action'),
(2, 'Comedy'),
(3, 'Drama'),
(4, 'Horror'),
(5, 'Romance'),
(6, 'Sci-Fi'),
(7, 'Thriller'),
(8, 'Animation');

-- Sample Roles
INSERT IGNORE INTO movietheater_roles (role_id, role_name) VALUES
(1, 'ADMIN'),
(2, 'EMPLOYEE'),
(3, 'MEMBER'),
(4, 'CUSTOMER');

-- Sample Admin Account
-- Password: admin123 (will be encoded by Spring Security)
INSERT IGNORE INTO movietheater_account (
    account_id, username, password, full_name, email, 
    phone_number, address, date_of_birth, gender, 
    identity_card, register_date, status, role_id
) VALUES (
    'admin001', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9tYoHA8t0r5lDvC', 
    'System Administrator', 'admin@movietheater.com',
    '0123456789', '123 Admin Street, Hanoi', '1990-01-01', 'Male',
    '123456789', NOW(), 1, 1
);

-- Sample Employee Account
-- Password: employee123
INSERT IGNORE INTO movietheater_account (
    account_id, username, password, full_name, email, 
    phone_number, address, date_of_birth, gender, 
    identity_card, register_date, status, role_id
) VALUES (
    'emp001', 'employee', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9tYoHA8t0r5lDvC', 
    'John Employee', 'employee@movietheater.com',
    '0987654321', '456 Employee Street, Hanoi', '1995-05-15', 'Male',
    '987654321', NOW(), 1, 2
);

-- Sample Member Account
-- Password: member123
INSERT IGNORE INTO movietheater_account (
    account_id, username, password, full_name, email, 
    phone_number, address, date_of_birth, gender, 
    identity_card, register_date, status, role_id
) VALUES (
    'mem001', 'member', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9tYoHA8t0r5lDvC', 
    'Jane Member', 'member@movietheater.com',
    '0111222333', '789 Member Street, Hanoi', '1992-08-20', 'Female',
    '111222333', NOW(), 1, 3
);

-- Sample Member record
INSERT IGNORE INTO movietheater_member (member_id, account_id, score) VALUES
('mem001', 'mem001', 100);

-- Sample Employee record
INSERT IGNORE INTO movietheater_employee (employee_id, account_id) VALUES
('emp001', 'emp001');

-- Sample Movies
INSERT IGNORE INTO movietheater_movie (
    movie_id, movie_name_english, movie_name_vn, content, director, actor,
    duration, from_date, to_date, movie_production_company, version,
    large_image, small_image, cinema_room_id
) VALUES 
('mov001', 'Avengers: Endgame', 'Biệt Đội Siêu Anh Hùng: Hồi Kết', 
 'The epic conclusion to the Infinity Saga', 'Anthony Russo, Joe Russo', 
 'Robert Downey Jr., Chris Evans, Mark Ruffalo', 181, '2024-01-01', '2024-12-31',
 'Marvel Studios', '2D', 'avengers_large.jpg', 'avengers_small.jpg', 1),

('mov002', 'Spider-Man: No Way Home', 'Người Nhện: Không Còn Nhà', 
 'Spider-Man faces his greatest challenge yet', 'Jon Watts', 
 'Tom Holland, Zendaya, Benedict Cumberbatch', 148, '2024-01-01', '2024-12-31',
 'Sony Pictures', '2D', 'spiderman_large.jpg', 'spiderman_small.jpg', 2);

-- Sample Movie-Type relationships
INSERT IGNORE INTO movietheater_movie_type (movie_id, type_id) VALUES
('mov001', 1), -- Avengers: Action
('mov001', 6), -- Avengers: Sci-Fi
('mov002', 1), -- Spider-Man: Action
('mov002', 6); -- Spider-Man: Sci-Fi

-- Sample Schedules
INSERT IGNORE INTO movietheater_schedule (schedule_id, schedule_time) VALUES
(1, '09:00:00'),
(2, '12:00:00'),
(3, '15:00:00'),
(4, '18:00:00'),
(5, '21:00:00');

-- Sample Show Dates
INSERT IGNORE INTO movietheater_show_dates (show_date_id, show_date, date_name) VALUES
(1, '2024-06-01', 'Saturday'),
(2, '2024-06-02', 'Sunday'),
(3, '2024-06-03', 'Monday'),
(4, '2024-06-04', 'Tuesday'),
(5, '2024-06-05', 'Wednesday');

-- Sample Movie Schedules
INSERT IGNORE INTO movietheater_movie_schedule (movie_id, schedule_id) VALUES
('mov001', 1), ('mov001', 3), ('mov001', 5),
('mov002', 2), ('mov002', 4);

-- Sample Movie Dates
INSERT IGNORE INTO movietheater_movie_date (movie_id, show_date_id) VALUES
('mov001', 1), ('mov001', 2), ('mov001', 3),
('mov002', 1), ('mov002', 2), ('mov002', 4);

-- Sample Promotions
INSERT IGNORE INTO movietheater_promotion (
    promotion_id, title, detail, discount_level, 
    start_time, end_time, image
) VALUES 
(1, 'Weekend Special', 'Get 20% off on weekend bookings', 20, 
 '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'weekend_promo.jpg'),
 
(2, 'Student Discount', 'Students get 15% off with valid ID', 15, 
 '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'student_promo.jpg');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_username ON movietheater_account(username);
CREATE INDEX IF NOT EXISTS idx_account_email ON movietheater_account(email);
CREATE INDEX IF NOT EXISTS idx_movie_dates ON movietheater_movie(from_date, to_date);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON movietheater_schedule(schedule_time);

-- Print success message
SELECT 'Database initialized successfully with sample data!' as message; 