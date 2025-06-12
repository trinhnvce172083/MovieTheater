package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.cinema.CinemaRoomCreateRequest;
import com.swp.MovieTheaterService.dto.cinema.CinemaRoomResponse;
import com.swp.MovieTheaterService.dto.schedule.ScheduleCreateRequest;
import com.swp.MovieTheaterService.dto.schedule.ScheduleResponse;
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
 * @author Dũng_Solo
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
            "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00");

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

            // Lấy danh sách phòng chiếu
            List<CinemaRoom> availableRooms = cinemaRoomRepository.findByIsActiveTrue();
            if (availableRooms.isEmpty()) {
                log.warn("Không có phòng chiếu nào khả dụng");
                errors.add("Không có phòng chiếu nào khả dụng");
                return new AutoScheduleResult(false, "Không có phòng chiếu nào khả dụng",
                        0, 0, 0, errors);
            }

            // Kiểm tra và tạo thêm phòng nếu cần
            if (availableRooms.size() < nowShowingMovies.size()) {
                AutoRoomCreationResult roomResult = createAdditionalRoomsIfNeeded();
                if (roomResult.isSuccess()) {
                    availableRooms = cinemaRoomRepository.findByIsActiveTrue(); // Reload rooms
                    log.info("Đã tạo thêm {} phòng chiếu", roomResult.getRoomsCreated());
                }
            }

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
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + movieId));

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
        log.info("Kiểm tra và tạo thêm phòng chiếu nếu cần thiết");

        List<String> errors = new ArrayList<>();
        List<String> roomNames = new ArrayList<>();
        int roomsCreated = 0;

        try {
            List<Movie> nowShowingMovies = movieRepository.findByStatusAndIsActiveTrue("NOW_SHOWING");
            List<CinemaRoom> currentRooms = cinemaRoomRepository.findByIsActiveTrue();

            int neededRooms = Math.max(0, nowShowingMovies.size() - currentRooms.size());

            if (neededRooms == 0) {
                return new AutoRoomCreationResult(true, "Số phòng hiện tại đủ để phục vụ",
                        0, new ArrayList<>(), new ArrayList<>());
            }

            log.info("Cần tạo thêm {} phòng chiếu", neededRooms);

            // Tạo các phòng chiếu mới với cấu hình đa dạng
            String[] roomTypes = { "STANDARD", "VIP", "IMAX", "4DX" };

            for (int i = 0; i < neededRooms; i++) {
                try {
                    String roomType = roomTypes[i % roomTypes.length];
                    String roomName = generateRoomName(roomType, currentRooms.size() + roomsCreated + 1);

                    CinemaRoomCreateRequest roomRequest = createRoomRequest(roomName, roomType);
                    CinemaRoomResponse newRoom = cinemaRoomService.createCinemaRoom(roomRequest);

                    roomNames.add(newRoom.getCinemaRoomName());
                    roomsCreated++;

                    log.info("Đã tạo phòng mới: {}", newRoom.getCinemaRoomName());

                } catch (Exception e) {
                    log.error("Lỗi khi tạo phòng thứ {}: {}", i + 1, e.getMessage());
                    errors.add("Lỗi tạo phòng thứ " + (i + 1) + ": " + e.getMessage());
                }
            }

            String message = String.format("Đã tạo thành công %d phòng chiếu mới", roomsCreated);
            return new AutoRoomCreationResult(true, message, roomsCreated, roomNames, errors);

        } catch (Exception e) {
            log.error("Lỗi khi tạo phòng chiếu tự động: {}", e.getMessage(), e);
            errors.add("Lỗi hệ thống: " + e.getMessage());
            return new AutoRoomCreationResult(false, "Tạo phòng thất bại: " + e.getMessage(),
                    roomsCreated, roomNames, errors);
        }
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

        // Chọn số suất chiếu dựa trên độ phổ biến của phim
        int schedulesPerDay = determineSchedulesPerDay(movie);

        // Chọn khung giờ chiếu phù hợp
        List<String> selectedTimes = selectOptimalShowtimes(schedulesPerDay);

        // Chọn phòng chiếu phù hợp
        List<CinemaRoom> suitableRooms = selectSuitableRooms(movie, availableRooms, schedulesPerDay);

        for (int i = 0; i < Math.min(Math.min(schedulesPerDay, suitableRooms.size()), selectedTimes.size()); i++) {
            try {
                CinemaRoom room = suitableRooms.get(i);
                LocalTime startTime = LocalTime.parse(selectedTimes.get(i));
                LocalTime endTime = calculateEndTime(startTime, movie.getDuration());

                // Kiểm tra xung đột lịch chiếu
                if (!scheduleService.hasScheduleConflict(room.getCinemaRoomId(), date, startTime, endTime)) {
                    ScheduleCreateRequest request = createScheduleRequest(movie, room, date, startTime, endTime);
                    ScheduleResponse schedule = scheduleService.createSchedule(request);
                    schedules.add(schedule);

                    log.debug("Tạo lịch chiếu: {} - {} tại phòng {} lúc {}",
                            movie.getTitle(), date, room.getCinemaRoomName(), startTime);
                }
            } catch (Exception e) {
                log.error("Lỗi khi tạo lịch chiếu cho phim {} vào {}: {}",
                        movie.getTitle(), selectedTimes.get(i), e.getMessage());
            }
        }

        return schedules;
    }

    private int determineSchedulesPerDay(Movie movie) {
        // Phim hot/featured có nhiều suất chiếu hơn
        if (movie.getIsFeatured()) {
            return 4; // 4 suất/ngày cho phim nổi bật
        }

        // Dựa trên rating IMDB
        if (movie.getImdbRating() != null && movie.getImdbRating() >= 8.0) {
            return 3; // 3 suất/ngày cho phim rating cao
        }

        return 2; // 2 suất/ngày cho phim thường
    }

    private List<String> selectOptimalShowtimes(int count) {
        List<String> selected = new ArrayList<>();

        // Ưu tiên các khung giờ vàng
        List<String> priorityTimes = Arrays.asList(
                "14:30", "16:30", "19:00", "21:00", "18:30", "20:30", "15:00", "17:00");

        selected.addAll(priorityTimes.subList(0, Math.min(count, priorityTimes.size())));

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

        // Nếu không đủ, thêm các phòng thường
        if (suitable.size() < neededCount) {
            for (CinemaRoom room : availableRooms) {
                if (!suitable.contains(room) && suitable.size() < neededCount) {
                    suitable.add(room);
                }
            }
        }

        // Sắp xếp theo sức chứa (phòng lớn trước)
        suitable.sort((r1, r2) -> Integer.compare(r2.getSeatQuantity(), r1.getSeatQuantity()));

        return suitable;
    }

    private boolean isRoomSuitableForMovie(Movie movie, CinemaRoom room) {
        // Logic chọn phòng phù hợp dựa trên thể loại phim
        String genre = movie.getGenres() != null ? movie.getGenres().toLowerCase() : "";

        if (genre.contains("action") || genre.contains("adventure") || genre.contains("sci-fi")) {
            return room.isIMAX() || room.is4DX() || room.getHasDolbyAtmos();
        }

        if (genre.contains("romance") || genre.contains("drama")) {
            return room.isVIP() || room.getHasReclinerSeats();
        }

        return true; // Phòng thường phù hợp với mọi loại phim
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

        // Tính giá vé dựa trên giá gốc của phim và hệ số phòng
        double basePrice = movie.getPrice();
        double roomMultiplier = room.getPriceMultiplier();
        double timeMultiplier = getTimeMultiplier(startTime);

        double finalPrice = basePrice * roomMultiplier * timeMultiplier;
        request.setPrice(Math.round(finalPrice / 1000.0) * 1000.0); // Làm tròn đến nghìn

        // Cài đặt tính năng đặc biệt
        request.setIs3D(room.getHas3D());
        request.setIsIMAX(room.isIMAX());
        request.setIs4DX(room.is4DX());
        request.setSubtitleLanguage("Vietnamese");
        request.setAudioLanguage("Vietnamese");

        return request;
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
        switch (roomType) {
            case "VIP":
                return "VIP-" + number;
            case "IMAX":
                return "IMAX-" + number;
            case "4DX":
                return "4DX-" + number;
            default:
                return "Standard-" + number;
        }
    }

    private CinemaRoomCreateRequest createRoomRequest(String roomName, String roomType) {
        CinemaRoomCreateRequest request = new CinemaRoomCreateRequest();
        request.setCinemaRoomName(roomName);
        request.setRoomType(roomType);

        // Cấu hình theo loại phòng
        switch (roomType) {
            case "VIP":
                request.setSeatQuantity(60);
                request.setRows(6);
                request.setColumns(10);
                request.setHasReclinerSeats(true);
                request.setPriceMultiplier(1.5);
                request.setDescription("Phòng VIP với ghế cao cấp");
                break;
            case "IMAX":
                request.setSeatQuantity(200);
                request.setRows(15);
                request.setColumns(14);
                request.setHasDolbyAtmos(true);
                request.setPriceMultiplier(1.8);
                request.setDescription("Phòng IMAX với màn hình và âm thanh đặc biệt");
                break;
            case "4DX":
                request.setSeatQuantity(80);
                request.setRows(8);
                request.setColumns(10);
                request.setPriceMultiplier(2.0);
                request.setDescription("Phòng 4DX với hiệu ứng chuyển động");
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

                // Kiểm tra xem ngày đó đã có lịch chiếu chưa
                List<Schedule> existingSchedules = scheduleRepository.findByShowDateAndIsActiveTrue(targetDate);

                if (!existingSchedules.isEmpty()) {
                    log.info("Ngày {} đã có {} lịch chiếu, bỏ qua", targetDate, existingSchedules.size());
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
}