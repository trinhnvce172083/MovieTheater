package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.cinema.CinemaRoomCreateRequest;
import com.swp.MovieTheaterService.dto.cinema.CinemaRoomResponse;
import com.swp.MovieTheaterService.dto.schedule.ScheduleCreateRequest;
import com.swp.MovieTheaterService.dto.schedule.ScheduleResponse;
import com.swp.MovieTheaterService.dto.schedule.MultipleMovieScheduleRequest;
import com.swp.MovieTheaterService.dto.schedule.MultipleMovieScheduleResponse;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.AutoScheduleException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.entity.CinemaRoom;
import com.swp.MovieTheaterService.entity.Movie;
import com.swp.MovieTheaterService.entity.Schedule;
import com.swp.MovieTheaterService.repository.CinemaRoomRepository;
import com.swp.MovieTheaterService.repository.MovieRepository;
import com.swp.MovieTheaterService.repository.ScheduleRepository;
import com.swp.MovieTheaterService.service.AutoScheduleService;
import com.swp.MovieTheaterService.service.CinemaRoomService;
import com.swp.MovieTheaterService.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Auto Schedule Service Implementation
 * Triển khai dịch vụ tự động tạo lịch chiếu phim
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AutoScheduleServiceImpl implements AutoScheduleService {

    private final MovieRepository movieRepository;
    private final CinemaRoomRepository cinemaRoomRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleService scheduleService;
    private final CinemaRoomService cinemaRoomService;

    // Giờ chiếu chuẩn theo các rạp lớn (CGV, Lotte Cinema, Galaxy Cinema)
    private static final List<String> STANDARD_SHOWTIMES = Arrays.asList(
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
            "20:00", "20:30", "21:00", "21:30", "22:00");

    // Khung giờ chiếu tối ưu cho từng loại phòng (CHỈ STANDARD VÀ VIP)
    private static final Map<String, List<String>> ROOM_OPTIMAL_TIMES = Map.of(
            "STANDARD", Arrays.asList("09:00", "11:30", "14:00", "16:30", "19:00", "21:30"),
            "VIP", Arrays.asList("10:00", "13:00", "16:00", "19:30", "22:00"));

    // Giá vé theo khung giờ
    private static final Map<String, Double> TIME_PRICE_MULTIPLIER = Map.of(
            "MORNING", 0.8, // 8:00 - 12:00
            "AFTERNOON", 1.0, // 12:00 - 18:00
            "EVENING", 1.2, // 18:00 - 22:00
            "LATE_NIGHT", 1.1 // 22:00 - 23:30
    );

    @Override
    public AutoScheduleResult generateSchedulesForNext3Days() {
        log.info("Bắt đầu tạo lịch chiếu tự động cho 3 ngày tiếp theo");

        // Cập nhật trạng thái phim trước khi tạo lịch
        updateMovieStatusBasedOnDates();

        LocalDate today = LocalDate.now();
        List<String> errors = new ArrayList<>();
        List<ScheduleResponse> allCreatedSchedules = new ArrayList<>();
        int totalSchedulesCreated = 0;
        int moviesProcessed = 0;
        Set<Long> roomsUsed = new HashSet<>();

        try {
            // Tạo lịch chiếu cho 3 ngày tiếp theo
            for (int i = 1; i <= 3; i++) {
                LocalDate targetDate = today.plusDays(i);

                log.info("Tạo lịch chiếu cho ngày: {}", targetDate);
                AutoScheduleResult dayResult = generateSchedulesForDate(targetDate);

                if (dayResult.isSuccess()) {
                    totalSchedulesCreated += dayResult.getTotalSchedulesCreated();
                    moviesProcessed += dayResult.getMoviesProcessed();
                    roomsUsed.add((long) dayResult.getRoomsUsed());
                    if (dayResult.getCreatedSchedules() != null) {
                        allCreatedSchedules.addAll(dayResult.getCreatedSchedules());
                    }
                }

                if (dayResult.getErrors() != null) {
                    errors.addAll(dayResult.getErrors());
                }
            }

            String message = String.format("Đã tạo thành công %d lịch chiếu cho %d phim trong 3 ngày tiếp theo",
                    totalSchedulesCreated, moviesProcessed);

            AutoScheduleResult result = new AutoScheduleResult(true, message, totalSchedulesCreated,
                    moviesProcessed, roomsUsed.size(), errors);
            result.setCreatedSchedules(allCreatedSchedules);

            log.info("Hoàn thành tạo lịch chiếu tự động: {}", message);
            return result;

        } catch (Exception e) {
            log.error("Lỗi khi tạo lịch chiếu tự động: {}", e.getMessage(), e);
            errors.add("Lỗi hệ thống: " + e.getMessage());
            return new AutoScheduleResult(false, "Tạo lịch chiếu thất bại: " + e.getMessage(),
                    totalSchedulesCreated, moviesProcessed, roomsUsed.size(), errors);
        }
    }

    @Override
    public AutoScheduleResult generateSchedulesForDate(LocalDate date) {
        log.info("Tạo lịch chiếu cho ngày: {}", date);

        List<String> errors = new ArrayList<>();
        List<ScheduleResponse> createdSchedules = new ArrayList<>();
        int moviesProcessed = 0;
        Set<Long> roomsUsed = new HashSet<>();

        try {
            // Kiểm tra xem ngày đã có lịch chiếu chưa
            List<Schedule> existingSchedules = scheduleRepository.findByShowDateAndIsActiveTrue(date);
            if (!existingSchedules.isEmpty()) {
                log.info("Ngày {} đã có {} lịch chiếu, bỏ qua", date, existingSchedules.size());
                return new AutoScheduleResult(true, "Ngày này đã có lịch chiếu",
                        0, 0, 0, new ArrayList<>());
            }

            // Lấy danh sách phim NOW_SHOWING
            List<Movie> nowShowingMovies = movieRepository.findByStatusAndIsActiveTrue("NOW_SHOWING");
            if (nowShowingMovies.isEmpty()) {
                log.warn("Không có phim nào đang chiếu");
                return new AutoScheduleResult(true, "Không có phim nào đang chiếu",
                        0, 0, 0, new ArrayList<>());
            }

            // Lấy danh sách phòng chiếu (đã fix cứng trong database)
            List<CinemaRoom> availableRooms = cinemaRoomRepository.findByIsActiveTrue();
            if (availableRooms.isEmpty()) {
                log.warn("Không có phòng chiếu nào khả dụng");
                errors.add("Không có phòng chiếu nào khả dụng");
                return new AutoScheduleResult(false, "Không có phòng chiếu nào khả dụng",
                        0, 0, 0, errors);
            }

            log.info("Sử dụng {} phòng chiếu có sẵn: {} STANDARD, {} VIP",
                    availableRooms.size(),
                    availableRooms.stream().filter(r -> "STANDARD".equals(r.getRoomType())).count(),
                    availableRooms.stream().filter(r -> "VIP".equals(r.getRoomType())).count());

            // Tạo lịch chiếu cho từng phim
            for (Movie movie : nowShowingMovies) {
                try {
                    List<ScheduleResponse> movieSchedules = createSchedulesForMovie(movie, date, availableRooms);
                    createdSchedules.addAll(movieSchedules);
                    moviesProcessed++;

                    // Cập nhật danh sách phòng đã sử dụng
                    movieSchedules.forEach(schedule -> roomsUsed.add(schedule.getCinemaRoomId()));

                } catch (Exception e) {
                    log.error("Lỗi khi tạo lịch chiếu cho phim {}: {}", movie.getTitle(), e.getMessage());
                    errors.add("Lỗi tạo lịch cho phim " + movie.getTitle() + ": " + e.getMessage());
                }
            }

            String message = String.format("Đã tạo %d lịch chiếu cho %d phim vào ngày %s",
                    createdSchedules.size(), moviesProcessed, date);

            AutoScheduleResult result = new AutoScheduleResult(true, message, createdSchedules.size(),
                    moviesProcessed, roomsUsed.size(), errors);
            result.setCreatedSchedules(createdSchedules);

            log.info(message);
            return result;

        } catch (Exception e) {
            log.error("Lỗi khi tạo lịch chiếu cho ngày {}: {}", date, e.getMessage(), e);
            errors.add("Lỗi hệ thống: " + e.getMessage());
            return new AutoScheduleResult(false, "Tạo lịch chiếu thất bại: " + e.getMessage(),
                    createdSchedules.size(), moviesProcessed, roomsUsed.size(), errors);
        }
    }

    @Override
    public AutoScheduleResult generateSchedulesForMovie(Long movieId, LocalDate startDate, LocalDate endDate) {
        log.info("Tạo lịch chiếu cho phim ID: {} từ {} đến {}", movieId, startDate, endDate);

        List<String> errors = new ArrayList<>();
        List<ScheduleResponse> createdSchedules = new ArrayList<>();
        Set<Long> roomsUsed = new HashSet<>();

        try {
            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

            if (!"NOW_SHOWING".equals(movie.getStatus())) {
                errors.add("Phim không ở trạng thái đang chiếu");
                return new AutoScheduleResult(false, "Phim không ở trạng thái đang chiếu",
                        0, 0, 0, errors);
            }

            List<CinemaRoom> availableRooms = cinemaRoomRepository.findByIsActiveTrue();
            if (availableRooms.isEmpty()) {
                errors.add("Không có phòng chiếu nào khả dụng");
                return new AutoScheduleResult(false, "Không có phòng chiếu nào khả dụng",
                        0, 0, 0, errors);
            }

            LocalDate currentDate = startDate;
            while (!currentDate.isAfter(endDate)) {
                try {
                    List<ScheduleResponse> daySchedules = createSchedulesForMovie(movie, currentDate, availableRooms);
                    createdSchedules.addAll(daySchedules);
                    daySchedules.forEach(schedule -> roomsUsed.add(schedule.getCinemaRoomId()));
                } catch (Exception e) {
                    log.error("Lỗi khi tạo lịch chiếu cho ngày {}: {}", currentDate, e.getMessage());
                    errors.add("Lỗi ngày " + currentDate + ": " + e.getMessage());
                }
                currentDate = currentDate.plusDays(1);
            }

            String message = String.format("Đã tạo %d lịch chiếu cho phim %s",
                    createdSchedules.size(), movie.getTitle());

            AutoScheduleResult result = new AutoScheduleResult(true, message, createdSchedules.size(),
                    1, roomsUsed.size(), errors);
            result.setCreatedSchedules(createdSchedules);

            return result;

        } catch (Exception e) {
            log.error("Lỗi khi tạo lịch chiếu cho phim {}: {}", movieId, e.getMessage(), e);
            errors.add("Lỗi hệ thống: " + e.getMessage());
            return new AutoScheduleResult(false, "Tạo lịch chiếu thất bại: " + e.getMessage(),
                    createdSchedules.size(), 0, roomsUsed.size(), errors);
        }
    }

    @Override
    public AutoRoomCreationResult createAdditionalRoomsIfNeeded() {
        log.info("Database đã được fix cứng với 3 phòng STANDARD + 1 phòng VIP");
        log.info("Không cần tạo thêm phòng chiếu");

        return new AutoRoomCreationResult(true,
                "Database đã fix cứng phòng chiếu - không cần tạo thêm",
                0, new ArrayList<>(), new ArrayList<>());
    }

    @Override
    public AutoScheduleResult dailyScheduleGeneration() {
        log.info("Chạy tác vụ tạo lịch chiếu hàng ngày");

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate dayAfterTomorrow = LocalDate.now().plusDays(2);
        LocalDate thirdDay = LocalDate.now().plusDays(3);

        // Kiểm tra ngày nào cần tạo lịch
        List<LocalDate> datesToProcess = new ArrayList<>();

        if (needsScheduleGeneration(tomorrow)) {
            datesToProcess.add(tomorrow);
        }
        if (needsScheduleGeneration(dayAfterTomorrow)) {
            datesToProcess.add(dayAfterTomorrow);
        }
        if (needsScheduleGeneration(thirdDay)) {
            datesToProcess.add(thirdDay);
        }

        if (datesToProcess.isEmpty()) {
            return new AutoScheduleResult(true, "Tất cả ngày đều đã có lịch chiếu đầy đủ",
                    0, 0, 0, new ArrayList<>());
        }

        // Tạo lịch cho các ngày cần thiết
        List<String> allErrors = new ArrayList<>();
        List<ScheduleResponse> allSchedules = new ArrayList<>();
        int totalSchedules = 0;
        int totalMovies = 0;
        Set<Long> roomsUsed = new HashSet<>();

        for (LocalDate date : datesToProcess) {
            AutoScheduleResult dayResult = generateSchedulesForDate(date);
            totalSchedules += dayResult.getTotalSchedulesCreated();
            totalMovies += dayResult.getMoviesProcessed();
            roomsUsed.add((long) dayResult.getRoomsUsed());

            if (dayResult.getErrors() != null) {
                allErrors.addAll(dayResult.getErrors());
            }
            if (dayResult.getCreatedSchedules() != null) {
                allSchedules.addAll(dayResult.getCreatedSchedules());
            }
        }

        String message = String.format("Tác vụ hàng ngày: Tạo %d lịch chiếu cho %d ngày",
                totalSchedules, datesToProcess.size());

        AutoScheduleResult result = new AutoScheduleResult(true, message, totalSchedules,
                totalMovies, roomsUsed.size(), allErrors);
        result.setCreatedSchedules(allSchedules);

        return result;
    }

    @Override
    public AutoScheduleStatistics getAutoScheduleStatistics() {
        log.info("Lấy thống kê tạo lịch tự động");

        LocalDate now = LocalDate.now();
        LocalDate sevenDaysAgo = now.minusDays(7);

        // Thống kê lịch chiếu
        long totalSchedules = scheduleRepository.count();
        long schedulesLast7Days = scheduleRepository.findByShowDateBetweenAndIsActiveTrue(sevenDaysAgo, now).size();
        long averagePerDay = schedulesLast7Days / 7;

        // Thống kê phòng và phim
        long totalRooms = cinemaRoomRepository.countByIsActiveTrue();
        long nowShowingMovies = movieRepository.countByStatus("NOW_SHOWING");

        // Tỷ lệ lấp đầy trung bình
        List<Schedule> recentSchedules = scheduleRepository.findByShowDateBetweenAndIsActiveTrue(sevenDaysAgo, now);
        double averageOccupancy = recentSchedules.stream()
                .mapToDouble(Schedule::getOccupancyRate)
                .average()
                .orElse(0.0);

        LocalDate nextGenerationDate = now.plusDays(1);

        return new AutoScheduleStatistics(totalSchedules, schedulesLast7Days, averagePerDay,
                totalRooms, nowShowingMovies, averageOccupancy,
                now, nextGenerationDate);
    }

    @Override
    public List<StandardShowtime> getStandardShowtimes() {
        List<StandardShowtime> showtimes = new ArrayList<>();

        showtimes.add(new StandardShowtime("MORNING_EARLY", "08:00", "10:30", "Suất chiếu sớm", 0.8));
        showtimes.add(new StandardShowtime("MORNING", "09:00", "11:30", "Suất chiếu buổi sáng", 0.8));
        showtimes.add(new StandardShowtime("MORNING_LATE", "10:30", "13:00", "Suất chiếu cuối buổi sáng", 0.9));
        showtimes.add(new StandardShowtime("AFTERNOON_EARLY", "12:00", "14:30", "Suất chiếu đầu buổi chiều", 1.0));
        showtimes.add(new StandardShowtime("AFTERNOON", "14:30", "17:00", "Suất chiếu buổi chiều", 1.0));
        showtimes.add(new StandardShowtime("AFTERNOON_LATE", "16:30", "19:00", "Suất chiếu cuối buổi chiều", 1.1));
        showtimes.add(new StandardShowtime("EVENING_EARLY", "18:00", "20:30", "Suất chiếu đầu buổi tối", 1.2));
        showtimes.add(new StandardShowtime("EVENING", "19:30", "22:00", "Suất chiếu buổi tối", 1.2));
        showtimes.add(new StandardShowtime("EVENING_LATE", "21:00", "23:30", "Suất chiếu cuối buổi tối", 1.1));
        showtimes.add(new StandardShowtime("LATE_NIGHT", "22:30", "01:00", "Suất chiếu đêm", 1.1));

        return showtimes;
    }

    @Override
    public List<LocalDate> getDatesThatNeedSchedules() {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 1; i <= 3; i++) {
            LocalDate date = today.plusDays(i);
            if (needsScheduleGeneration(date)) {
                dates.add(date);
            }
        }

        return dates;
    }

    // Private helper methods

    private List<ScheduleResponse> createSchedulesForMovie(Movie movie, LocalDate date,
            List<CinemaRoom> availableRooms) {
        List<ScheduleResponse> schedules = new ArrayList<>();

        log.info("Tạo lịch chiếu cho phim: {} trên {} phòng", movie.getTitle(), availableRooms.size());

        // Phân loại phòng theo loại
        Map<String, List<CinemaRoom>> roomsByType = availableRooms.stream()
                .collect(Collectors.groupingBy(this::getRoomType));

        // Tạo lịch chiếu đa dạng cho từng loại phòng
        for (Map.Entry<String, List<CinemaRoom>> entry : roomsByType.entrySet()) {
            String roomType = entry.getKey();
            List<CinemaRoom> roomsOfType = entry.getValue();

            // Lấy khung giờ tối ưu cho loại phòng này
            List<String> optimalTimes = ROOM_OPTIMAL_TIMES.getOrDefault(roomType,
                    Arrays.asList("14:00", "19:00", "21:30"));

            log.info("Tạo lịch cho {} phòng {} với {} khung giờ",
                    roomsOfType.size(), roomType, optimalTimes.size());

            // Tạo lịch chiếu cho từng phòng thuộc loại này
            for (int roomIndex = 0; roomIndex < roomsOfType.size(); roomIndex++) {
                CinemaRoom room = roomsOfType.get(roomIndex);

                // Mỗi phòng sẽ có 2-3 suất chiếu với khung giờ khác nhau
                int schedulesPerRoom = Math.min(3, optimalTimes.size());

                for (int timeIndex = 0; timeIndex < schedulesPerRoom; timeIndex++) {
                    try {
                        // Chọn khung giờ theo pattern để tránh trùng
                        int selectedTimeIndex = (roomIndex + timeIndex * roomsOfType.size()) % optimalTimes.size();
                        String selectedTime = optimalTimes.get(selectedTimeIndex);

                        LocalTime startTime = LocalTime.parse(selectedTime);
                        LocalTime endTime = calculateEndTime(startTime, movie.getDuration());

                        // Kiểm tra xung đột lịch chiếu
                        if (!scheduleService.hasScheduleConflict(room.getCinemaRoomId(), date, startTime, endTime)) {
                            ScheduleCreateRequest request = createScheduleRequest(movie, room, date, startTime,
                                    endTime);
                            ScheduleResponse schedule = scheduleService.createSchedule(request);
                            schedules.add(schedule);

                            log.debug("✓ Tạo lịch: {} - {} tại {} lúc {}",
                                    movie.getTitle(), date, room.getCinemaRoomName(), startTime);
                        } else {
                            log.debug("✗ Bị xung đột: {} tại {} lúc {}",
                                    movie.getTitle(), room.getCinemaRoomName(), startTime);
                        }
                    } catch (Exception e) {
                        log.error("Lỗi khi tạo lịch chiếu cho phim {} tại phòng {}: {}",
                                movie.getTitle(), room.getCinemaRoomName(), e.getMessage());
                    }
                }
            }
        }

        log.info("Đã tạo {} lịch chiếu cho phim {}", schedules.size(), movie.getTitle());
        return schedules;
    }

    private String getRoomType(CinemaRoom room) {
        // Chỉ hỗ trợ STANDARD và VIP (database đã fix cứng)
        if (room.isVIP()) {
            return "VIP";
        }
        // Mặc định là STANDARD
        return "STANDARD";
    }

    private int determineSchedulesPerDay(Movie movie) {
        // Với hệ thống mới, mỗi phim sẽ có nhiều suất chiếu trên nhiều phòng
        if (movie.getIsFeatured()) {
            return 8; // 8 suất/ngày cho phim nổi bật trên nhiều phòng
        }

        // Dựa trên rating IMDB
        if (movie.getImdbRating() != null && movie.getImdbRating() >= 8.0) {
            return 6; // 6 suất/ngày cho phim rating cao
        }

        return 4; // 4 suất/ngày cho phim thường
    }

    private List<String> selectOptimalShowtimes(int count) {
        List<String> selected = new ArrayList<>();

        // Ưu tiên các khung giờ vàng với phân bố đều trong ngày
        List<String> priorityTimes = Arrays.asList(
                "09:00", "11:30", "14:00", "16:30", "19:00", "21:30", // Khung giờ chính
                "10:00", "12:30", "15:00", "17:30", "20:00", "22:00", // Khung giờ phụ
                "08:30", "13:30", "18:30", "20:30"); // Khung giờ bổ sung

        // Chọn theo pattern để phân bố đều
        for (int i = 0; i < count && i < priorityTimes.size(); i++) {
            selected.add(priorityTimes.get(i));
        }

        // Nếu cần thêm, lấy từ danh sách chuẩn
        if (selected.size() < count) {
            for (String time : STANDARD_SHOWTIMES) {
                if (!selected.contains(time) && selected.size() < count) {
                    selected.add(time);
                }
            }
        }

        return selected;
    }

    private List<CinemaRoom> selectSuitableRooms(Movie movie, List<CinemaRoom> availableRooms, int neededCount) {
        List<CinemaRoom> suitable = new ArrayList<>();

        // Ưu tiên phòng phù hợp với loại phim
        for (CinemaRoom room : availableRooms) {
            if (isRoomSuitableForMovie(movie, room)) {
                suitable.add(room);
            }
        }

        // Thêm tất cả phòng còn lại để đảm bảo sử dụng hết
        for (CinemaRoom room : availableRooms) {
            if (!suitable.contains(room)) {
                suitable.add(room);
            }
        }

        // Sắp xếp theo thứ tự ưu tiên: VIP trước, STANDARD sau
        suitable.sort((r1, r2) -> {
            int priority1 = getRoomPriority(r1);
            int priority2 = getRoomPriority(r2);
            if (priority1 != priority2) {
                return Integer.compare(priority1, priority2);
            }
            // Nếu cùng loại, ưu tiên phòng lớn hơn
            return Integer.compare(r2.getSeatQuantity(), r1.getSeatQuantity());
        });

        return suitable;
    }

    private int getRoomPriority(CinemaRoom room) {
        // Chỉ hỗ trợ VIP và STANDARD (database đã fix cứng)
        if (room.isVIP()) {
            return 1; // VIP có độ ưu tiên cao nhất
        }
        return 2; // STANDARD rooms
    }

    private boolean isRoomSuitableForMovie(Movie movie, CinemaRoom room) {
        // Logic chọn phòng phù hợp với chỉ STANDARD và VIP
        String genre = movie.getGenres() != null ? movie.getGenres().toLowerCase() : "";

        // Logic thể loại cho STANDARD và VIP
        // Romance/Drama/Comedy phù hợp với VIP (trải nghiệm cao cấp)
        if (genre.contains("romance") || genre.contains("drama") || genre.contains("comedy")) {
            return room.isVIP() || room.getHasReclinerSeats();
        }

        // Action/Thriller/Horror phù hợp với cả VIP và STANDARD
        if (genre.contains("action") || genre.contains("thriller") || genre.contains("horror")) {
            return true; // Cả hai loại phòng đều phù hợp
        }

        // Animation/Family phù hợp với STANDARD (phù hợp gia đình)
        if (genre.contains("animation") || genre.contains("family")) {
            return !room.isVIP(); // Ưu tiên STANDARD cho gia đình
        }

        return true; // Phòng STANDARD phù hợp với mọi loại phim
    }

    private LocalTime calculateEndTime(LocalTime startTime, Integer duration) {
        if (duration == null) {
            duration = 120; // Default 2 hours
        }

        // Thêm 30 phút cho quảng cáo và dọn dẹp
        int totalMinutes = duration + 30;
        return startTime.plusMinutes(totalMinutes);
    }

    private ScheduleCreateRequest createScheduleRequest(Movie movie, CinemaRoom room, LocalDate date,
            LocalTime startTime, LocalTime endTime) {
        ScheduleCreateRequest request = new ScheduleCreateRequest();
        request.setMovieId(movie.getMovieId());
        request.setCinemaRoomId(room.getCinemaRoomId());
        request.setShowDate(date);
        request.setStartTime(startTime);
        request.setEndTime(endTime);

        // Sử dụng giá gốc của phim (đã đơn giản hóa, không tính theo giờ)
        double basePrice = movie.getPrice();
        String timeSlotType = getTimeSlotType(startTime);

        // Chỉ sử dụng giá gốc của phim, không nhân thêm hệ số
        request.setPrice(basePrice);
        request.setTimeSlotType(timeSlotType); // Set time slot type

        // Cài đặt tính năng đặc biệt (chỉ VIP và STANDARD)
        request.setIs3D(room.getHas3D());
        request.setIsIMAX(false); // Không có IMAX trong database fix cứng
        request.setIs4DX(false); // Không có 4DX trong database fix cứng
        request.setSubtitleLanguage("Vietnamese");
        request.setAudioLanguage("English");

        return request;
    }

    private String getTimeSlotType(LocalTime startTime) {
        int hour = startTime.getHour();

        if (hour >= 8 && hour < 12) {
            return "MORNING";
        } else if (hour >= 12 && hour < 18) {
            return "AFTERNOON";
        } else if (hour >= 18 && hour < 22) {
            return "EVENING";
        } else {
            return "LATE_NIGHT";
        }
    }

    private double getTimeMultiplier(LocalTime startTime) {
        int hour = startTime.getHour();

        if (hour >= 8 && hour < 12) {
            return TIME_PRICE_MULTIPLIER.get("MORNING");
        } else if (hour >= 12 && hour < 18) {
            return TIME_PRICE_MULTIPLIER.get("AFTERNOON");
        } else if (hour >= 18 && hour < 22) {
            return TIME_PRICE_MULTIPLIER.get("EVENING");
        } else {
            return TIME_PRICE_MULTIPLIER.get("LATE_NIGHT");
        }
    }

    private boolean needsScheduleGeneration(LocalDate date) {
        List<Schedule> existingSchedules = scheduleRepository.findByShowDateAndIsActiveTrue(date);
        List<Movie> nowShowingMovies = movieRepository.findByStatusAndIsActiveTrue("NOW_SHOWING");

        // Cần tạo lịch nếu số lịch chiếu hiện tại < số phim đang chiếu * 2
        int minimumSchedulesNeeded = nowShowingMovies.size() * 2;
        return existingSchedules.size() < minimumSchedulesNeeded;
    }

    private String generateRoomName(String roomType, int number) {
        // Chỉ hỗ trợ VIP và STANDARD (database đã fix cứng)
        switch (roomType) {
            case "VIP":
                return "VIP Cinema Room " + number;
            default:
                return "Standard Room " + number;
        }
    }

    private CinemaRoomCreateRequest createRoomRequest(String roomName, String roomType) {
        CinemaRoomCreateRequest request = new CinemaRoomCreateRequest();
        request.setCinemaRoomName(roomName);
        request.setRoomType(roomType);

        // Cấu hình theo loại phòng (chỉ VIP và STANDARD)
        switch (roomType) {
            case "VIP":
                request.setSeatQuantity(60);
                request.setRows(6);
                request.setColumns(10);
                request.setHasReclinerSeats(true);
                request.setPriceMultiplier(1.8);
                request.setDescription("Phòng VIP với ghế cao cấp và bàn ăn");
                break;
            default: // STANDARD
                request.setSeatQuantity(120);
                request.setRows(10);
                request.setColumns(12);
                request.setPriceMultiplier(1.0);
                request.setDescription("Phòng chiếu tiêu chuẩn");
                break;
        }

        return request;
    }

    @Override
    public AutoScheduleResult generateSchedulesFromTomorrow() {
        log.info("Bắt đầu tạo lịch chiếu từ ngày mai");

        // Trước tiên, kiểm tra và cập nhật trạng thái phim
        updateMovieStatusBasedOnDates();

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<String> errors = new ArrayList<>();
        List<ScheduleResponse> allCreatedSchedules = new ArrayList<>();
        int totalSchedulesCreated = 0;
        int moviesProcessed = 0;
        Set<Long> roomsUsed = new HashSet<>();

        try {
            // Kiểm tra phim NOW_SHOWING (sau khi đã cập nhật trạng thái)
            List<Movie> nowShowingMovies = movieRepository.findByStatusAndIsActiveTrue("NOW_SHOWING");
            if (nowShowingMovies.isEmpty()) {
                log.warn("Không có phim nào đang ở trạng thái NOW_SHOWING");
                return new AutoScheduleResult(false, "Không có phim nào đang chiếu (NOW_SHOWING)",
                        0, 0, 0, List.of("Không tìm thấy phim NOW_SHOWING trong database"));
            }

            log.info("Tìm thấy {} phim NOW_SHOWING hợp lệ", nowShowingMovies.size());

            // Log thông tin các phim NOW_SHOWING
            for (Movie movie : nowShowingMovies) {
                log.info("Phim NOW_SHOWING: {} (ID: {}) - Release: {} - End: {}",
                        movie.getTitle(), movie.getMovieId(), movie.getReleaseDate(), movie.getEndDate());
            }

            // Tạo lịch chiếu cho 3 ngày: ngày mai, ngày kia, và ngày thứ 3
            for (int i = 1; i <= 3; i++) {
                LocalDate targetDate = tomorrow.plusDays(i - 1);

                // Kiểm tra xem ngày đó có cần thêm lịch chiếu không
                List<Schedule> existingSchedules = scheduleRepository.findByShowDateAndIsActiveTrue(targetDate);

                // Chỉ bỏ qua nếu đã có đủ schedule cho tất cả phim NOW_SHOWING
                int expectedSchedulesPerMovie = 2; // Tối thiểu 2 lịch chiếu/phim/ngày
                int minimumSchedulesNeeded = nowShowingMovies.size() * expectedSchedulesPerMovie;

                if (existingSchedules.size() >= minimumSchedulesNeeded) {
                    log.info("Ngày {} đã có {} lịch chiếu (cần tối thiểu {}), bỏ qua",
                            targetDate, existingSchedules.size(), minimumSchedulesNeeded);
                    continue;
                }

                log.info("Tạo lịch chiếu cho ngày: {}", targetDate);
                AutoScheduleResult dayResult = generateSchedulesForDate(targetDate);

                if (dayResult.isSuccess()) {
                    totalSchedulesCreated += dayResult.getTotalSchedulesCreated();
                    moviesProcessed += dayResult.getMoviesProcessed();
                    roomsUsed.add((long) dayResult.getRoomsUsed());
                    if (dayResult.getCreatedSchedules() != null) {
                        allCreatedSchedules.addAll(dayResult.getCreatedSchedules());
                    }
                    log.info("Đã tạo {} lịch chiếu cho ngày {}", dayResult.getTotalSchedulesCreated(), targetDate);
                }

                if (dayResult.getErrors() != null) {
                    errors.addAll(dayResult.getErrors());
                }
            }

            String message = String.format("Đã tạo thành công %d lịch chiếu cho %d phim từ ngày mai (%s)",
                    totalSchedulesCreated, nowShowingMovies.size(), tomorrow);

            AutoScheduleResult result = new AutoScheduleResult(true, message, totalSchedulesCreated,
                    moviesProcessed, roomsUsed.size(), errors);
            result.setCreatedSchedules(allCreatedSchedules);

            log.info("Hoàn thành tạo lịch chiếu từ ngày mai: {}", message);
            return result;

        } catch (Exception e) {
            log.error("Lỗi khi tạo lịch chiếu từ ngày mai: {}", e.getMessage(), e);
            errors.add("Lỗi hệ thống: " + e.getMessage());
            return new AutoScheduleResult(false, "Tạo lịch chiếu thất bại: " + e.getMessage(),
                    totalSchedulesCreated, moviesProcessed, roomsUsed.size(), errors);
        }
    }

    @Override
    public DatabaseStatusResponse checkDatabaseStatus() {
        log.info("Kiểm tra trạng thái database");

        try {
            DatabaseStatusResponse response = new DatabaseStatusResponse();
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            LocalDate dayAfterTomorrow = today.plusDays(2);
            LocalDate threeDaysLater = today.plusDays(3);

            // Kiểm tra phim NOW_SHOWING
            List<Movie> nowShowingMovies = movieRepository.findByStatusAndIsActiveTrue("NOW_SHOWING");
            response.setNowShowingMoviesCount(nowShowingMovies.size());
            response.setNowShowingMovieTitles(nowShowingMovies.stream()
                    .map(Movie::getTitle)
                    .collect(Collectors.toList()));

            // Kiểm tra tổng số lịch chiếu (lấy từ ngày hôm nay trở đi)
            LocalDate farFuture = today.plusYears(1); // 1 năm tới
            List<Schedule> allSchedules = scheduleRepository.findByShowDateBetweenAndIsActiveTrue(today, farFuture);
            response.setTotalSchedulesCount(allSchedules.size());

            // Kiểm tra lịch chiếu cho 3 ngày tiếp theo
            LocalDate startDate = tomorrow;
            LocalDate endDate = threeDaysLater;
            List<Schedule> schedulesNext3Days = scheduleRepository.findByShowDateBetweenAndIsActiveTrue(startDate,
                    endDate);
            response.setSchedulesForNext3Days(schedulesNext3Days.size());

            // Lấy các ngày đã có lịch chiếu
            List<LocalDate> datesWithSchedules = allSchedules.stream()
                    .map(Schedule::getShowDate)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            response.setDatesWithSchedules(datesWithSchedules);

            // Kiểm tra từng ngày cụ thể
            response.setHasSchedulesForTomorrow(!scheduleRepository.findByShowDateAndIsActiveTrue(tomorrow).isEmpty());
            response.setHasSchedulesForDayAfterTomorrow(
                    !scheduleRepository.findByShowDateAndIsActiveTrue(dayAfterTomorrow).isEmpty());
            response.setHasSchedulesFor3DaysLater(
                    !scheduleRepository.findByShowDateAndIsActiveTrue(threeDaysLater).isEmpty());

            // Tìm ngày cần tạo lịch
            List<LocalDate> datesNeedingSchedules = new ArrayList<>();
            for (int i = 1; i <= 3; i++) {
                LocalDate checkDate = today.plusDays(i);
                if (needsScheduleGeneration(checkDate)) {
                    datesNeedingSchedules.add(checkDate);
                }
            }
            response.setDatesNeedingSchedules(datesNeedingSchedules);

            // Tạo status message và recommendations
            List<String> recommendations = new ArrayList<>();

            if (nowShowingMovies.isEmpty()) {
                response.setSystemStatus("CRITICAL: Không có phim nào đang chiếu");
                recommendations.add("Cần cập nhật trạng thái phim thành NOW_SHOWING");
            } else if (datesNeedingSchedules.isEmpty()) {
                response.setSystemStatus("GOOD: Hệ thống hoạt động bình thường, đã có đủ lịch chiếu");
                recommendations.add("Hệ thống hoạt động tốt, không cần hành động gì");
            } else {
                response.setSystemStatus("WARNING: Cần tạo lịch chiếu cho một số ngày");
                recommendations.add("Nên chạy tạo lịch tự động cho các ngày: " + datesNeedingSchedules);
                recommendations.add("Có thể dùng API /auto-schedule/trigger-immediate để tạo lịch ngay");
            }

            // Thêm recommendations khác
            if (nowShowingMovies.size() > 0 && schedulesNext3Days.size() < nowShowingMovies.size() * 2) {
                recommendations.add("Số lịch chiếu có thể chưa đủ cho số lượng phim đang chiếu");
            }

            response.setRecommendations(recommendations);

            log.info("Trạng thái database: {} phim NOW_SHOWING, {} lịch chiếu tổng, {} lịch 3 ngày tới",
                    nowShowingMovies.size(), allSchedules.size(), schedulesNext3Days.size());

            return response;

        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra trạng thái database: {}", e.getMessage(), e);

            DatabaseStatusResponse errorResponse = new DatabaseStatusResponse();
            errorResponse.setSystemStatus("ERROR: Lỗi khi kiểm tra database");
            errorResponse.setRecommendations(List.of("Kiểm tra kết nối database và logs hệ thống"));
            return errorResponse;
        }
    }

    /**
     * Kiểm tra và cập nhật trạng thái phim dựa trên ngày release và end date
     */
    private void updateMovieStatusBasedOnDates() {
        log.info("Kiểm tra và cập nhật trạng thái phim dựa trên ngày");

        LocalDate today = LocalDate.now();

        try {
            // Lấy tất cả phim active
            List<Movie> allMovies = movieRepository.findByIsActiveTrue();
            int updatedCount = 0;

            for (Movie movie : allMovies) {
                String oldStatus = movie.getStatus();
                String newStatus = determineMovieStatus(movie, today);

                if (!oldStatus.equals(newStatus)) {
                    movie.setStatus(newStatus);
                    movieRepository.save(movie);
                    updatedCount++;

                    log.info("Cập nhật trạng thái phim '{}': {} -> {}",
                            movie.getTitle(), oldStatus, newStatus);
                }
            }

            log.info("Đã cập nhật trạng thái cho {} phim", updatedCount);

        } catch (Exception e) {
            log.error("Lỗi khi cập nhật trạng thái phim: {}", e.getMessage(), e);
        }
    }

    /**
     * Xác định trạng thái phim dựa trên ngày hiện tại
     */
    private String determineMovieStatus(Movie movie, LocalDate today) {
        LocalDate releaseDate = movie.getReleaseDate();
        LocalDate endDate = movie.getEndDate();

        // Nếu không có ngày release, mặc định là COMING_SOON
        if (releaseDate == null) {
            return "COMING_SOON";
        }

        // Nếu chưa đến ngày công chiếu
        if (today.isBefore(releaseDate)) {
            return "COMING_SOON";
        }

        // Nếu đã qua ngày kết thúc chiếu
        if (endDate != null && today.isAfter(endDate)) {
            return "ENDED";
        }

        // Nếu trong khoảng thời gian chiếu
        return "NOW_SHOWING";
    }

    /**
     * Tạo lịch chiếu tự động cho NHIỀU PHIM cùng lúc
     * Phân bổ đồng đều và logic giữa các phim
     * 
     * @param request Yêu cầu tạo lịch cho nhiều phim
     * @return Kết quả chi tiết cho từng phim
     */
    @Transactional(rollbackFor = { AutoScheduleException.class }, noRollbackFor = { RuntimeException.class,
            IllegalArgumentException.class })
    public MultipleMovieScheduleResponse generateSchedulesForMultipleMovies(MultipleMovieScheduleRequest request) {
        log.info("🎬 Bắt đầu tạo lịch chiếu cho {} phim từ {} đến {}",
                request.getMovieIds().size(), request.getStartDate(), request.getEndDate());

        MultipleMovieScheduleResponse response = MultipleMovieScheduleResponse.builder()
                .processingStartTime(java.time.LocalDateTime.now())
                .movieResults(new ArrayList<>())
                .roomDistribution(new HashMap<>())
                .timeSlotDistribution(new HashMap<>())
                .warnings(new ArrayList<>())
                .errors(new ArrayList<>())
                .build();

        try {
            // Validate request
            validateMultipleMovieRequest(request);

            // Lấy danh sách phim với validation
            List<Movie> movies = getAndValidateMovies(request.getMovieIds());

            // Lấy danh sách phòng chiếu với validation
            List<CinemaRoom> availableRooms = getAndValidateRooms();

            // Sắp xếp phim theo độ ưu tiên
            List<Movie> prioritizedMovies = prioritizeMovies(movies, request);

            // Tạo lịch chiếu thông minh với error handling
            createBalancedScheduleForMultipleMoviesWithErrorHandling(prioritizedMovies, request, availableRooms,
                    response);

            // Tính toán thống kê
            calculateDistributionStats(response);

            return finalizeResponse(response, "SUCCESS");

        } catch (AutoScheduleException e) {
            log.error("❌ AutoSchedule Error: {}", e.getDetailedMessage());
            response.getErrors().add(e.getMessage());
            return finalizeResponse(response, "FAILED");

        } catch (org.springframework.transaction.UnexpectedRollbackException e) {
            log.warn("⚠️ Transaction Rollback - nhưng có thể đã tạo được một số lịch chiếu: {}", e.getMessage());

            // Kiểm tra xem có lịch chiếu nào được tạo không
            int totalSchedulesCreated = response.getMovieResults().stream()
                    .mapToInt(result -> result.getSchedulesCreated())
                    .sum();

            if (totalSchedulesCreated > 0) {
                log.info("✅ Mặc dù có rollback, đã tạo được {} lịch chiếu", totalSchedulesCreated);
                response.getWarnings()
                        .add("Có một số lỗi validation nhỏ nhưng đã tạo được " + totalSchedulesCreated + " lịch chiếu");
                return finalizeResponse(response, "PARTIAL_SUCCESS");
            } else {
                response.getErrors().add("Transaction bị rollback: " + e.getMessage());
                return finalizeResponse(response, "FAILED");
            }

        } catch (Exception e) {
            log.error("❌ Unexpected Error: {}", e.getMessage(), e);
            response.getErrors().add("Lỗi hệ thống không xác định: " + e.getMessage());
            return finalizeResponse(response, "FAILED");
        }
    }

    /**
     * Validate request cho multiple movies
     */
    private void validateMultipleMovieRequest(MultipleMovieScheduleRequest request) {
        if (!request.isValid()) {
            throw AutoScheduleException.validationFailed("Request validation failed: " + request.toString());
        }

        // Kiểm tra số lượng phim
        if (request.getMovieIds().size() > 20) {
            throw AutoScheduleException.validationFailed("Không thể tạo lịch cho quá 20 phim cùng lúc");
        }

        // Kiểm tra khoảng thời gian
        if (request.getTotalDays() > 30) {
            throw AutoScheduleException.invalidDateRange(
                    String.format("Khoảng thời gian %d ngày vượt quá giới hạn 30 ngày", request.getTotalDays()));
        }

        // Kiểm tra ngày trong quá khứ
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_PAST_DATE, "date-validation");
        }
    }

    /**
     * Lấy và validate danh sách phim
     */
    private List<Movie> getAndValidateMovies(List<Long> movieIds) {
        try {
            List<Movie> movies = movieRepository.findAllById(movieIds);

            if (movies.isEmpty()) {
                throw AutoScheduleException.movieNotFound(movieIds);
            }

            // Kiểm tra phim không tồn tại
            if (movies.size() != movieIds.size()) {
                Set<Long> foundIds = movies.stream().map(Movie::getMovieId).collect(Collectors.toSet());
                List<Long> missingIds = movieIds.stream()
                        .filter(id -> !foundIds.contains(id))
                        .collect(Collectors.toList());
                throw AutoScheduleException.movieNotFound(missingIds);
            }

            // Kiểm tra trạng thái phim
            List<Movie> invalidStatusMovies = movies.stream()
                    .filter(movie -> !"NOW_SHOWING".equals(movie.getStatus()))
                    .collect(Collectors.toList());

            if (!invalidStatusMovies.isEmpty()) {
                String movieTitles = invalidStatusMovies.stream()
                        .map(Movie::getTitle)
                        .collect(Collectors.joining(", "));
                throw new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_MOVIE_NOT_SHOWING,
                        "movie-status-check", movieTitles);
            }

            return movies;

        } catch (Exception e) {
            if (e instanceof AutoScheduleException) {
                throw e;
            }
            throw AutoScheduleException.databaseError(e);
        }
    }

    /**
     * Lấy và validate danh sách phòng chiếu
     */
    private List<CinemaRoom> getAndValidateRooms() {
        try {
            List<CinemaRoom> availableRooms = cinemaRoomRepository.findByIsActiveTrue();

            if (availableRooms.isEmpty()) {
                throw AutoScheduleException.noRoomsAvailable();
            }

            log.info("✅ Tìm thấy {} phòng chiếu khả dụng", availableRooms.size());
            return availableRooms;

        } catch (Exception e) {
            if (e instanceof AutoScheduleException) {
                throw e;
            }
            throw AutoScheduleException.databaseError(e);
        }
    }

    /**
     * Tạo lịch chiếu cân bằng với error handling
     */
    private void createBalancedScheduleForMultipleMoviesWithErrorHandling(List<Movie> movies,
            MultipleMovieScheduleRequest request,
            List<CinemaRoom> availableRooms,
            MultipleMovieScheduleResponse response) {

        LocalDate currentDate = request.getStartDate();
        int successfulDays = 0;
        int totalDays = (int) request.getTotalDays();

        log.info("🗓️ Bắt đầu tạo lịch cho {} ngày từ {} đến {}", totalDays, request.getStartDate(),
                request.getEndDate());

        while (!currentDate.isAfter(request.getEndDate())) {

            log.info("📅 Tạo lịch chiếu cho ngày: {}", currentDate);

            try {
                // Kiểm tra xem ngày này đã có lịch chiếu chưa
                if (hasExistingSchedules(currentDate)) {
                    log.warn("⚠️ Ngày {} đã có lịch chiếu, bỏ qua", currentDate);
                    response.getWarnings().add("Ngày " + currentDate + " đã có lịch chiếu, bỏ qua");
                    currentDate = currentDate.plusDays(1);
                    continue;
                }

                // Tạo lịch chiếu cho ngày này
                createSchedulesForDayWithErrorHandling(movies, currentDate, request, availableRooms, response);
                successfulDays++;
                log.info("✅ Tạo lịch thành công cho ngày {}", currentDate);

            } catch (AutoScheduleException e) {
                log.warn("⚠️ Lỗi khi tạo lịch cho ngày {}: {}", currentDate, e.getMessage());
                response.getWarnings().add("Ngày " + currentDate + ": " + e.getMessage());

            } catch (Exception e) {
                log.error("❌ Lỗi không xác định cho ngày {}: {}", currentDate, e.getMessage(), e);
                response.getErrors().add("Ngày " + currentDate + ": Lỗi hệ thống - " + e.getMessage());
            }

            currentDate = currentDate.plusDays(1);
        }

        log.info("📊 Kết quả tạo lịch: {}/{} ngày thành công", successfulDays, totalDays);

        // Kiểm tra kết quả tổng thể
        if (successfulDays == 0) {
            log.error("❌ Không có ngày nào tạo lịch thành công!");
            throw new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_FAILED, "all-days-failed");
        } else if (successfulDays < totalDays) {
            log.warn("⚠️ Chỉ tạo thành công lịch cho {}/{} ngày", successfulDays, totalDays);
        } else {
            log.info("🎉 Tạo lịch thành công cho tất cả {} ngày", totalDays);
        }
    }

    /**
     * Tạo lịch chiếu cho một ngày với error handling - THUẬT TOÁN ROUND-ROBIN CẢI
     * TIẾN
     */
    private void createSchedulesForDayWithErrorHandling(List<Movie> movies,
            LocalDate date,
            MultipleMovieScheduleRequest request,
            List<CinemaRoom> availableRooms,
            MultipleMovieScheduleResponse response) {

        log.info("🎬 Bắt đầu tạo lịch cho {} phim vào ngày {} - THUẬT TOÁN ROUND-ROBIN CẢI TIẾN", movies.size(), date);

        // Tạo "bể thời gian" có sẵn cho ngày này
        List<String> availableTimeSlots = new ArrayList<>(STANDARD_SHOWTIMES);
        log.info("⏰ Có {} khung giờ khả dụng: {}", availableTimeSlots.size(), availableTimeSlots);

        // Tạo "bể phòng" có sẵn cho ngày này
        Map<String, List<CinemaRoom>> roomsByType = availableRooms.stream()
                .collect(Collectors.groupingBy(room -> getRoomType(room)));
        log.info("🏠 Phòng chiếu theo loại: {}", roomsByType.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().size())));

        // Tính quota tối đa cho từng phim
        Map<Movie, Integer> movieMaxQuota = new HashMap<>();
        for (Movie movie : movies) {
            int maxQuota = calculateSchedulesForMovieInDay(movie, request, date);
            movieMaxQuota.put(movie, maxQuota);
            log.info("📋 Phim '{}' có thể có tối đa {} suất chiếu", movie.getTitle(), maxQuota);
        }

        // THUẬT TOÁN ROUND-ROBIN CẢI TIẾN: Phân bổ từng slot thời gian
        Map<Movie, Integer> movieScheduleCreated = new HashMap<>();
        movies.forEach(movie -> movieScheduleCreated.put(movie, 0));

        int totalSchedulesForDay = 0;
        int movieIndex = 0; // Index để xoay vòng giữa các phim

        log.info("🔄 Bắt đầu phân bổ {} slot thời gian cho {} phim", availableTimeSlots.size(), movies.size());

        // Phân bổ từng slot thời gian theo round-robin
        while (!availableTimeSlots.isEmpty()) {

            // Tìm phim tiếp theo cần lịch chiếu
            Movie selectedMovie = null;
            int attempts = 0;

            // Thử tối đa số lượng phim để tìm phim cần lịch chiếu
            while (attempts < movies.size() && selectedMovie == null) {
                Movie candidateMovie = movies.get(movieIndex % movies.size());
                int created = movieScheduleCreated.get(candidateMovie);
                int maxQuota = movieMaxQuota.get(candidateMovie);

                if (created < maxQuota) {
                    selectedMovie = candidateMovie;
                    log.debug("🎯 Chọn phim '{}' (slot {}/{})", candidateMovie.getTitle(), created + 1, maxQuota);
                } else {
                    log.debug("⏭️ Bỏ qua phim '{}' (đã đủ quota {}/{})", candidateMovie.getTitle(), created, maxQuota);
                }

                movieIndex++;
                attempts++;
            }

            // Nếu không tìm thấy phim nào cần lịch chiếu, dừng
            if (selectedMovie == null) {
                log.info("🏁 Tất cả phim đã đạt quota tối đa, dừng phân bổ");
                break;
            }

            // Lưu slot hiện tại để kiểm tra
            String currentTimeSlot = availableTimeSlots.isEmpty() ? null : availableTimeSlots.get(0);
            boolean scheduleCreated = false;

            try {
                // Tạo 1 lịch chiếu cho phim được chọn
                ScheduleResponse schedule = createSingleScheduleForMovie(
                        selectedMovie, date, availableTimeSlots, roomsByType);

                if (schedule != null) {
                    // Cập nhật kết quả cho phim
                    MultipleMovieScheduleResponse.MovieScheduleResult movieResult = getOrCreateMovieResult(
                            selectedMovie, response);
                    movieResult.setSchedulesCreated(movieResult.getSchedulesCreated() + 1);
                    updateMovieResult(movieResult, List.of(schedule), date);

                    // Cập nhật thống kê phân bổ
                    updateDistributionStats(response, List.of(schedule));

                    // Cập nhật counter
                    int newCount = movieScheduleCreated.get(selectedMovie) + 1;
                    movieScheduleCreated.put(selectedMovie, newCount);
                    totalSchedulesForDay++;
                    scheduleCreated = true;

                    log.info("✅ Tạo lịch chiếu cho '{}' - Slot {}/{} - Còn {} slot thời gian",
                            selectedMovie.getTitle(), newCount, movieMaxQuota.get(selectedMovie),
                            availableTimeSlots.size());
                } else {
                    log.warn("⚠️ Không thể tạo lịch cho phim '{}' với slot hiện tại", selectedMovie.getTitle());
                }

            } catch (Exception e) {
                log.warn("⚠️ Lỗi khi tạo lịch cho phim '{}': {}", selectedMovie.getTitle(), e.getMessage());
            }

            // QUAN TRỌNG: Nếu không tạo được lịch với slot hiện tại, loại bỏ slot đó
            if (!scheduleCreated && currentTimeSlot != null && availableTimeSlots.contains(currentTimeSlot)) {
                availableTimeSlots.remove(currentTimeSlot);
                log.warn("🚫 Loại bỏ slot thời gian '{}' vì không thể tạo lịch cho bất kỳ phim nào", currentTimeSlot);

                // Reset movieIndex để thử lại từ đầu với slot mới
                movieIndex = 0;
            }

            // Tránh vòng lặp vô hạn - kiểm tra nhiều điều kiện
            if (totalSchedulesForDay > 50) {
                log.warn("⚠️ Dừng sau 50 lịch chiếu để tránh vòng lặp vô hạn");
                break;
            }

            // Kiểm tra nếu tất cả phim đã đạt quota
            boolean allMoviesReachedQuota = movies.stream()
                    .allMatch(movie -> movieScheduleCreated.get(movie) >= movieMaxQuota.get(movie));

            if (allMoviesReachedQuota) {
                log.info("🎯 Tất cả phim đã đạt quota tối đa, kết thúc phân bổ");
                break;
            }
        }

        // Log kết quả cuối cùng
        log.info("📊 Kết quả ngày {}: {} lịch chiếu được tạo từ {} slot khả dụng",
                date, totalSchedulesForDay, STANDARD_SHOWTIMES.size());

        movieScheduleCreated.forEach((movie, created) -> {
            int maxQuota = movieMaxQuota.get(movie);
            double percentage = maxQuota > 0 ? (created * 100.0 / maxQuota) : 0;
            log.info("   - '{}': {}/{} lịch chiếu ({:.1f}%)",
                    movie.getTitle(), created, maxQuota, percentage);
        });

        // Nếu không có lịch chiếu nào được tạo cho ngày này, throw exception
        if (totalSchedulesForDay == 0) {
            throw new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_FAILED,
                    "no-schedules-created-for-day", "Không tạo được lịch chiếu nào cho ngày " + date);
        }
    }

    /**
     * Tạo 1 lịch chiếu cho 1 phim cụ thể - CẢI TIẾN CHỌN PHÒNG VÀ THỜI GIAN
     */
    private ScheduleResponse createSingleScheduleForMovie(Movie movie,
            LocalDate date,
            List<String> availableTimeSlots,
            Map<String, List<CinemaRoom>> roomsByType) {

        if (availableTimeSlots.isEmpty()) {
            log.warn("⚠️ Không còn slot thời gian nào cho phim '{}'", movie.getTitle());
            return null;
        }

        // Thử tất cả các phòng có thể
        List<CinemaRoom> allAvailableRooms = new ArrayList<>();

        // Ưu tiên phòng phù hợp với thể loại phim
        String preferredRoomType = getPreferredRoomTypeForMovie(movie);
        List<CinemaRoom> preferredRooms = roomsByType.get(preferredRoomType);
        if (preferredRooms != null) {
            allAvailableRooms.addAll(preferredRooms);
        }

        // Thêm các phòng khác nếu cần
        for (Map.Entry<String, List<CinemaRoom>> entry : roomsByType.entrySet()) {
            if (!entry.getKey().equals(preferredRoomType)) {
                allAvailableRooms.addAll(entry.getValue());
            }
        }

        if (allAvailableRooms.isEmpty()) {
            log.warn("⚠️ Không có phòng nào khả dụng cho phim '{}'", movie.getTitle());
            return null;
        }

        // Thử từng slot thời gian với từng phòng
        for (String timeSlot : new ArrayList<>(availableTimeSlots)) {
            log.debug("🕐 Thử slot thời gian {} cho phim '{}'", timeSlot, movie.getTitle());

            for (CinemaRoom room : allAvailableRooms) {
                try {
                    LocalTime startTime = LocalTime.parse(timeSlot);
                    LocalTime endTime = calculateEndTime(startTime, movie.getDuration());

                    // Kiểm tra xung đột thời gian cho phòng này
                    if (!hasTimeConflict(room, date, startTime, endTime)) {
                        // Tạo lịch chiếu với phòng này
                        ScheduleResponse schedule = createScheduleWithErrorHandling(movie, room, date, timeSlot);
                        if (schedule != null) {
                            // Loại bỏ thời gian đã sử dụng
                            availableTimeSlots.remove(timeSlot);
                            log.debug("🎯 Tạo lịch: '{}' - {} - Phòng {} - {}",
                                    movie.getTitle(), date, room.getCinemaRoomName(), timeSlot);
                            return schedule;
                        }
                    } else {
                        log.debug("⏭️ Phòng {} bị xung đột thời gian {}-{}, thử phòng khác",
                                room.getCinemaRoomName(), startTime, endTime);
                    }

                } catch (Exception e) {
                    log.debug("⚠️ Lỗi khi thử phòng {} lúc {}: {}", room.getCinemaRoomName(), timeSlot, e.getMessage());
                    // Tiếp tục thử phòng khác
                }
            }
        }

        log.warn("⚠️ Không tìm được slot thời gian và phòng nào phù hợp cho phim '{}'", movie.getTitle());
        return null;
    }

    // Các phương thức hỗ trợ khác
    private boolean hasExistingSchedules(LocalDate date) {
        return !scheduleRepository.findByShowDateAndIsActiveTrue(date).isEmpty();
    }

    private MultipleMovieScheduleResponse.MovieScheduleResult getOrCreateMovieResult(Movie movie,
            MultipleMovieScheduleResponse response) {
        return response.getMovieResults().stream()
                .filter(result -> result.getMovieId().equals(movie.getMovieId()))
                .findFirst()
                .orElseGet(() -> {
                    MultipleMovieScheduleResponse.MovieScheduleResult newResult = MultipleMovieScheduleResponse.MovieScheduleResult
                            .builder()
                            .movieId(movie.getMovieId())
                            .movieTitle(movie.getTitle())
                            .movieGenre(movie.getGenre())
                            .movieRating(movie.getImdbRating())
                            .schedulesCreated(0)
                            .status("PROCESSING")
                            .assignedRooms(new ArrayList<>())
                            .assignedTimeSlots(new ArrayList<>())
                            .dailyScheduleCount(new HashMap<>())
                            .build();
                    response.getMovieResults().add(newResult);
                    return newResult;
                });
    }

    private void updateMovieResult(MultipleMovieScheduleResponse.MovieScheduleResult result,
            List<ScheduleResponse> schedules, LocalDate date) {
        // Cập nhật phòng và thời gian đã sử dụng
        schedules.forEach(schedule -> {
            // Thêm phòng (nếu chưa có)
            String roomName = "Room " + schedule.getCinemaRoomId();
            if (!result.getAssignedRooms().contains(roomName)) {
                result.getAssignedRooms().add(roomName);
            }

            // Thêm thời gian (nếu chưa có)
            String timeSlot = schedule.getStartTime().toString();
            if (!result.getAssignedTimeSlots().contains(timeSlot)) {
                result.getAssignedTimeSlots().add(timeSlot);
            }
        });

        // Cập nhật số lượng theo ngày
        result.getDailyScheduleCount().put(date.toString(), schedules.size());

        // Cập nhật trạng thái
        result.setStatus("SUCCESS");
        result.setSuccessRate(100.0);
    }

    private void updateDistributionStats(MultipleMovieScheduleResponse response, List<ScheduleResponse> schedules) {
        schedules.forEach(schedule -> {
            // Thống kê phòng
            String roomKey = "Room " + schedule.getCinemaRoomId();
            response.getRoomDistribution().merge(roomKey, 1, Integer::sum);

            // Thống kê thời gian
            String timeKey = getTimeSlotType(schedule.getStartTime());
            response.getTimeSlotDistribution().merge(timeKey, 1, Integer::sum);
        });
    }

    private void calculateDistributionStats(MultipleMovieScheduleResponse response) {
        // Tính tổng số phòng được sử dụng
        if (response.getSummary() != null) {
            response.getSummary().setTotalRoomsUsed(response.getRoomDistribution().size());
        }

        // Tính tổng số ngày được lập lịch
        Set<String> scheduledDays = new HashSet<>();
        response.getMovieResults().forEach(result -> scheduledDays.addAll(result.getDailyScheduleCount().keySet()));

        if (response.getSummary() != null) {
            response.getSummary().setTotalDaysScheduled(scheduledDays.size());
        }
    }

    private MultipleMovieScheduleResponse finalizeResponse(MultipleMovieScheduleResponse response, String status) {
        response.setProcessingEndTime(java.time.LocalDateTime.now());
        response.calculateProcessingDuration();

        // Đảm bảo summary được khởi tạo trước khi calculateSummaryStats
        if (response.getSummary() == null) {
            response.setSummary(MultipleMovieScheduleResponse.BatchSummary.builder()
                    .totalMoviesProcessed(0)
                    .totalSchedulesCreated(0)
                    .successfulMovies(0)
                    .failedMovies(0)
                    .totalRoomsUsed(0)
                    .totalDaysScheduled(0)
                    .averageSchedulesPerMovie(0.0)
                    .status(status)
                    .build());
        }

        response.calculateSummaryStats();

        // Cập nhật status cuối cùng
        response.getSummary().setStatus(status);

        log.info("✅ Hoàn thành tạo lịch chiếu cho nhiều phim - Status: {}, Time: {}ms",
                status, response.getProcessingDurationMs());

        return response;
    }

    /**
     * Sắp xếp phim theo độ ưu tiên dựa trên nhiều yếu tố
     */
    private List<Movie> prioritizeMovies(List<Movie> movies, MultipleMovieScheduleRequest request) {
        return movies.stream()
                .sorted((m1, m2) -> {
                    int score1 = calculateMoviePriority(m1, request);
                    int score2 = calculateMoviePriority(m2, request);
                    return Integer.compare(score2, score1); // Sắp xếp giảm dần
                })
                .collect(Collectors.toList());
    }

    /**
     * Tính điểm ưu tiên cho phim
     */
    private int calculateMoviePriority(Movie movie, MultipleMovieScheduleRequest request) {
        int priority = 0;

        // Phim nổi bật
        if (request.getPrioritizeFeaturedMovies() && movie.getIsFeatured()) {
            priority += 50;
        }

        // IMDB Rating
        if (request.getAdjustByRating() && movie.getImdbRating() != null) {
            priority += (int) (movie.getImdbRating() * 10);
        }

        // Thể loại phim (một số thể loại được ưu tiên)
        if (movie.getGenre() != null) {
            switch (movie.getGenre().toLowerCase()) {
                case "action":
                case "thriller":
                    priority += 30;
                    break;
                case "comedy":
                case "family":
                    priority += 25;
                    break;
                case "romance":
                case "drama":
                    priority += 20;
                    break;
                default:
                    priority += 15;
            }
        }

        // Trạng thái phim
        if ("NOW_SHOWING".equals(movie.getStatus())) {
            priority += 40;
        } else if ("COMING_SOON".equals(movie.getStatus())) {
            priority += 10;
        }

        return priority;
    }

    /**
     * Tính số suất chiếu cho phim trong ngày
     */
    private int calculateSchedulesForMovieInDay(Movie movie, MultipleMovieScheduleRequest request, LocalDate date) {
        int baseSchedules = request.getMinShowsPerMoviePerDay();

        // Điều chỉnh dựa trên độ ưu tiên
        if (movie.getIsFeatured()) {
            baseSchedules += 1;
        }

        // Điều chỉnh dựa trên IMDB rating
        if (request.getAdjustByRating() && movie.getImdbRating() != null && movie.getImdbRating() >= 8.0) {
            baseSchedules += 1;
        }

        // Điều chỉnh cho cuối tuần
        if (date.getDayOfWeek().getValue() >= 6) { // Thứ 7 và Chủ nhật
            baseSchedules += 1;
        }

        return Math.min(baseSchedules, request.getMaxShowsPerMoviePerDay());
    }

    /**
     * Chọn thời gian tối ưu cho phim
     */
    private String selectBestTimeSlot(Movie movie, List<String> availableTimeSlots, int scheduleIndex) {
        if (availableTimeSlots.isEmpty()) {
            return null;
        }

        // Lấy thời gian tối ưu cho thể loại phim
        String roomType = getPreferredRoomTypeForMovie(movie);
        List<String> optimalTimes = ROOM_OPTIMAL_TIMES.getOrDefault(roomType, STANDARD_SHOWTIMES);

        // Tìm thời gian tối ưu có sẵn
        for (String optimalTime : optimalTimes) {
            if (availableTimeSlots.contains(optimalTime)) {
                return optimalTime;
            }
        }

        // Nếu không có thời gian tối ưu, chọn thời gian đầu tiên có sẵn
        return availableTimeSlots.get(0);
    }

    /**
     * Chọn phòng tốt nhất cho phim
     */
    private CinemaRoom selectBestRoom(Movie movie, Map<String, List<CinemaRoom>> roomsByType, String timeSlot) {
        String preferredRoomType = getPreferredRoomTypeForMovie(movie);

        // Ưu tiên phòng phù hợp với thể loại phim
        List<CinemaRoom> preferredRooms = roomsByType.get(preferredRoomType);
        if (preferredRooms != null && !preferredRooms.isEmpty()) {
            return preferredRooms.get(0);
        }

        // Nếu không có phòng ưu tiên, chọn phòng bất kỳ
        for (List<CinemaRoom> rooms : roomsByType.values()) {
            if (!rooms.isEmpty()) {
                return rooms.get(0);
            }
        }

        return null;
    }

    /**
     * Xác định loại phòng ưu tiên cho phim
     */
    private String getPreferredRoomTypeForMovie(Movie movie) {
        if (movie.getGenre() == null) {
            return "STANDARD";
        }

        switch (movie.getGenre().toLowerCase()) {
            case "romance":
            case "drama":
                return "VIP";
            case "family":
            case "animation":
                return "STANDARD";
            case "action":
            case "thriller":
            default:
                return "STANDARD"; // Mặc định
        }
    }

    /**
     * Tạo lịch chiếu cụ thể với error handling
     */
    private ScheduleResponse createScheduleWithErrorHandling(Movie movie, CinemaRoom room, LocalDate date,
            String timeString) {
        try {
            LocalTime startTime = LocalTime.parse(timeString);
            LocalTime endTime = calculateEndTime(startTime, movie.getDuration());

            // Kiểm tra xung đột thời gian
            if (hasTimeConflict(room, date, startTime, endTime)) {
                throw AutoScheduleException.timeConflict(
                        String.format("Phòng %s đã có lịch từ %s-%s ngày %s",
                                room.getCinemaRoomName(), startTime, endTime, date));
            }

            ScheduleCreateRequest request = createScheduleRequest(movie, room, date, startTime, endTime);
            return scheduleService.createSchedule(request);

        } catch (AutoScheduleException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi khi tạo lịch chiếu: {}", e.getMessage());
            throw AutoScheduleException.databaseError(e);
        }
    }

    /**
     * Kiểm tra xung đột thời gian - CẢI TIẾN VỚI LOGGING CHI TIẾT VÀ HỖ TRỢ PHIM
     * QUA ĐÊM
     */
    private boolean hasTimeConflict(CinemaRoom room, LocalDate date, LocalTime startTime, LocalTime endTime) {
        try {
            List<Schedule> existingSchedules = scheduleRepository
                    .findByShowDateAndIsActiveTrue(date);

            // Filter by room
            List<Schedule> roomSchedules = existingSchedules.stream()
                    .filter(schedule -> schedule.getCinemaRoom().getCinemaRoomId().equals(room.getCinemaRoomId()))
                    .collect(Collectors.toList());

            log.debug("🔍 Kiểm tra xung đột: Phòng {} ngày {} có {} lịch chiếu hiện tại",
                    room.getCinemaRoomName(), date, roomSchedules.size());

            for (Schedule existingSchedule : roomSchedules) {
                LocalTime existingStart = existingSchedule.getStartTime();
                LocalTime existingEnd = existingSchedule.getEndTime();

                // Kiểm tra overlap với hỗ trợ phim qua đêm
                boolean hasOverlap = checkTimeOverlap(startTime, endTime, existingStart, existingEnd);

                if (hasOverlap) {
                    log.debug("❌ Xung đột: Slot mới {}-{} trùng với lịch hiện tại {}-{}",
                            startTime, endTime, existingStart, existingEnd);
                    return true;
                } else {
                    log.debug("✅ OK: Slot mới {}-{} không trùng với lịch hiện tại {}-{}",
                            startTime, endTime, existingStart, existingEnd);
                }
            }

            log.debug("✅ Không có xung đột thời gian cho phòng {} slot {}-{}",
                    room.getCinemaRoomName(), startTime, endTime);
            return false;

        } catch (Exception e) {
            log.warn("⚠️ Không thể kiểm tra xung đột thời gian: {}", e.getMessage());
            return false; // Cho phép tạo nếu không thể kiểm tra
        }
    }

    /**
     * Kiểm tra overlap giữa 2 khoảng thời gian, hỗ trợ phim qua đêm
     */
    private boolean checkTimeOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        // Trường hợp 1: Cả hai đều không qua đêm
        if (!start1.isAfter(end1) && !start2.isAfter(end2)) {
            return !(end1.isBefore(start2) || start1.isAfter(end2));
        }

        // Trường hợp 2: Slot mới qua đêm, slot hiện tại không qua đêm
        if (start1.isAfter(end1) && !start2.isAfter(end2)) {
            // Slot qua đêm: start1 -> 23:59 và 00:00 -> end1
            return !(end2.isBefore(start1) && end2.isBefore(end1));
        }

        // Trường hợp 3: Slot hiện tại qua đêm, slot mới không qua đêm
        if (!start1.isAfter(end1) && start2.isAfter(end2)) {
            // Slot hiện tại qua đêm: start2 -> 23:59 và 00:00 -> end2
            return !(end1.isBefore(start2) && end1.isBefore(end2));
        }

        // Trường hợp 4: Cả hai đều qua đêm - luôn có xung đột
        if (start1.isAfter(end1) && start2.isAfter(end2)) {
            return true; // Không cho phép 2 phim qua đêm cùng lúc trong 1 phòng
        }

        return false;
    }
}