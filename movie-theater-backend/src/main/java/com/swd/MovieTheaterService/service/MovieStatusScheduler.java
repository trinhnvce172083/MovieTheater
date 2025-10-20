package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Movie;
import com.swp.MovieTheaterService.enums.MovieStatus;
import com.swp.MovieTheaterService.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Movie Status Scheduler Service
 * Tự động cập nhật trạng thái phim dựa trên ngày ra mắt
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MovieStatusScheduler {

    private final MovieRepository movieRepository;

    /**
     * Tự động cập nhật trạng thái phim mỗi ngày lúc 00:01
     * Chuyển từ COMING_SOON sang NOW_SHOWING nếu đã đến ngày ra mắt
     */
    @Scheduled(cron = "0 1 0 * * ?") // Chạy lúc 00:01 mỗi ngày
    @Transactional
    public Map<String, String> autoUpdateMovieStatus() {
        log.info("Starting automatic movie status update...");

        LocalDate today = LocalDate.now();
        int updatedCount = 0;
        Map<String, String> updatedMovies = new HashMap<>();

        try {
            // Tìm tất cả phim COMING_SOON đã đến ngày ra mắt
            List<Movie> comingSoonMovies = movieRepository.findMoviesForStatusUpdate(
                    MovieStatus.COMING_SOON.getCode(),
                    today);

            log.info("Found {} movies ready to change from COMING_SOON to NOW_SHOWING", comingSoonMovies.size());

            for (Movie movie : comingSoonMovies) {
                log.info("Updating movie '{}' (ID: {}) from COMING_SOON to NOW_SHOWING",
                        movie.getTitle(), movie.getMovieId());

                movie.setStatus(MovieStatus.NOW_SHOWING.getCode());
                movieRepository.save(movie);
                updatedCount++;
                updatedMovies.put(movie.getTitle(), "Updated");
            }

            log.info("Automatic movie status update completed. Updated {} movies.", updatedCount);

        } catch (Exception e) {
            log.error("Error during automatic movie status update", e);
        }

        return updatedMovies;
    }

    /**
     * Cập nhật trạng thái phim ngay lập tức (manual trigger)
     * Hữu ích cho testing hoặc manual execution
     */
    @Transactional
    public int updateMovieStatusNow() {
        log.info("Manual movie status update triggered");

        LocalDate today = LocalDate.now();
        int updatedCount = 0;

        try {
            List<Movie> comingSoonMovies = movieRepository.findMoviesForStatusUpdate(
                    MovieStatus.COMING_SOON.getCode(),
                    today);

            for (Movie movie : comingSoonMovies) {
                movie.setStatus(MovieStatus.NOW_SHOWING.getCode());
                movieRepository.save(movie);
                updatedCount++;
            }

            log.info("Manual movie status update completed. Updated {} movies.", updatedCount);
            return updatedCount;

        } catch (Exception e) {
            log.error("Error during manual movie status update", e);
            return 0;
        }
    }

    /**
     * Lấy thống kê về các phim cần cập nhật trạng thái
     */
    @Transactional(readOnly = true)
    public MovieStatusUpdateStats getStatusUpdateStats() {
        LocalDate today = LocalDate.now();

        long comingSoonCount = movieRepository.countByStatusAndIsActiveTrue(MovieStatus.COMING_SOON.getCode());
        long nowShowingCount = movieRepository.countByStatusAndIsActiveTrue(MovieStatus.NOW_SHOWING.getCode());
        long endedCount = movieRepository.countByStatusAndIsActiveTrue(MovieStatus.ENDED.getCode());

        List<Movie> readyToUpdate = movieRepository.findMoviesForStatusUpdate(
                MovieStatus.COMING_SOON.getCode(),
                today);

        return new MovieStatusUpdateStats(
                comingSoonCount,
                nowShowingCount,
                endedCount,
                readyToUpdate.size(),
                today);
    }

    /**
         * Inner class cho thống kê cập nhật trạng thái
         */
        public record MovieStatusUpdateStats(long comingSoonCount, long nowShowingCount, long endedCount,
                                             long readyToUpdateCount, LocalDate checkDate) {
    }
}
