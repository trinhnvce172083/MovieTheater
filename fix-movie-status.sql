-- ===============================================
-- 🎬 FIX MOVIE STATUS FOR AUTO SCHEDULE TESTING
-- ===============================================

USE cinema_db;

-- 1. Kiểm tra trạng thái phim hiện tại
SELECT 
    movie_id,
    title,
    status,
    release_date,
    end_date,
    is_active
FROM movietheater_movie 
ORDER BY movie_id;

-- 2. Cập nhật trạng thái phim để có phim NOW_SHOWING
UPDATE movietheater_movie 
SET 
    status = 'NOW_SHOWING',
    release_date = CURDATE() - INTERVAL 7 DAY,  -- Phát hành 1 tuần trước
    end_date = CURDATE() + INTERVAL 30 DAY,     -- Kết thúc sau 30 ngày
    is_active = TRUE
WHERE movie_id IN (1, 2, 3, 4, 5);

-- 3. Cập nhật một số phim khác thành COMING_SOON
UPDATE movietheater_movie 
SET 
    status = 'COMING_SOON',
    release_date = CURDATE() + INTERVAL 7 DAY,  -- Phát hành sau 1 tuần
    end_date = CURDATE() + INTERVAL 37 DAY,     -- Kết thúc sau 37 ngày
    is_active = TRUE
WHERE movie_id IN (6, 7, 8);

-- 4. Đảm bảo có featured movies
UPDATE movietheater_movie 
SET is_featured = TRUE 
WHERE movie_id IN (1, 3, 5);

-- 5. Cập nhật IMDB rating cho test
UPDATE movietheater_movie 
SET imdb_rating = 8.5 
WHERE movie_id = 1;

UPDATE movietheater_movie 
SET imdb_rating = 7.8 
WHERE movie_id = 2;

UPDATE movietheater_movie 
SET imdb_rating = 9.0 
WHERE movie_id = 3;

UPDATE movietheater_movie 
SET imdb_rating = 7.2 
WHERE movie_id = 4;

UPDATE movietheater_movie 
SET imdb_rating = 8.1 
WHERE movie_id = 5;

-- 6. Cập nhật thể loại phim
UPDATE movietheater_movie 
SET genres = 'Action' 
WHERE movie_id = 1;

UPDATE movietheater_movie 
SET genres = 'Romance' 
WHERE movie_id = 2;

UPDATE movietheater_movie 
SET genres = 'Thriller' 
WHERE movie_id = 3;

UPDATE movietheater_movie 
SET genres = 'Comedy' 
WHERE movie_id = 4;

UPDATE movietheater_movie 
SET genres = 'Drama' 
WHERE movie_id = 5;

-- 7. Kiểm tra kết quả
SELECT 
    movie_id,
    title,
    status,
    genres,
    imdb_rating,
    is_featured,
    release_date,
    end_date,
    is_active
FROM movietheater_movie 
WHERE is_active = TRUE
ORDER BY movie_id;

-- 8. Kiểm tra phim NOW_SHOWING
SELECT 
    COUNT(*) as total_now_showing,
    GROUP_CONCAT(movie_id) as movie_ids
FROM movietheater_movie 
WHERE status = 'NOW_SHOWING' AND is_active = TRUE;

COMMIT; 