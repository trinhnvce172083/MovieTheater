package com.swp.MovieTheaterService.dto.movie;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;
import com.swp.MovieTheaterService.enums.MovieStatus;

import java.time.LocalDate;

/**
 * Movie Update Request DTO
 * Data transfer object for updating existing movies
 * Chỉ update các field có nội dung thực sự (không null, empty, hoặc chỉ có
 * whitespace)
 * 
 * Đặc biệt:
 * - Để clear field: sử dụng string "CLEAR_FIELD"
 * - Để không thay đổi field: không gửi field hoặc để null
 * - Để update field: gửi giá trị mới
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Movie update request with smart field updating")
public class MovieUpdateRequest {

    @Size(max = 200, message = "Tiêu đề phim không được vượt quá 200 ký tự")
    @Schema(description = "Tiêu đề phim", example = "")
    private String title;

    @Size(max = 2000, message = "Mô tả phim không được vượt quá 2000 ký tự")
    @Schema(description = "Mô tả phim. Sử dụng 'CLEAR_FIELD' để xóa mô tả", example = "")
    private String description;

    @Min(value = 1, message = "Thời lượng phim phải lớn hơn 0 phút")
    @Max(value = 600, message = "Thời lượng phim không được vượt quá 600 phút")
    @Schema(description = "Thời lượng phim (phút)", example = "")
    private Integer duration;

    @Size(max = 100, message = "Thể loại phim không được vượt quá 100 ký tự")
    @Schema(description = "Thể loại phim. Sử dụng 'CLEAR_FIELD' để xóa thể loại", example = "")
    private String genre;

    @Size(max = 100, message = "Tên đạo diễn không được vượt quá 100 ký tự")
    @Schema(description = "Đạo diễn. Sử dụng 'CLEAR_FIELD' để xóa thông tin đạo diễn", example = "")
    private String director;

    @Size(max = 1000, message = "Danh sách diễn viên không được vượt quá 1000 ký tự")
    @Schema(description = "Diễn viên. Sử dụng 'CLEAR_FIELD' để xóa danh sách diễn viên", example = "")
    private String cast;

    @Size(max = 50, message = "Ngôn ngữ không được vượt quá 50 ký tự")
    @Schema(description = "Ngôn ngữ phim. Sử dụng 'CLEAR_FIELD' để xóa", example = "")
    private String language;

    @Size(max = 50, message = "Quốc gia không được vượt quá 50 ký tự")
    @Schema(description = "Quốc gia sản xuất. Sử dụng 'CLEAR_FIELD' để xóa", example = "")
    private String country;

    @Schema(description = "Ngày ra mắt", example = "")
    private LocalDate releaseDate;

    @Pattern(regexp = "^(G|PG|PG-13|R|NC-17)$", message = "Xếp hạng phim không hợp lệ (G, PG, PG-13, R, NC-17)")
    @Schema(description = "Xếp hạng phim", example = "")
    private String rating;

    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|webp)$", message = "URL poster phải là đường dẫn hợp lệ đến file ảnh")
    @Schema(description = "URL poster. Sử dụng 'CLEAR_FIELD' để xóa poster", example = "")
    private String posterUrl;

    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|webp)$", message = "URL backdrop phải là đường dẫn hợp lệ đến file ảnh")
    @Schema(description = "URL backdrop. Sử dụng 'CLEAR_FIELD' để xóa backdrop", example = "")
    private String backdropUrl;

    @Pattern(regexp = "^(https?://).*", message = "URL trailer phải là đường dẫn hợp lệ")
    @Schema(description = "URL trailer. Sử dụng 'CLEAR_FIELD' để xóa trailer", example = "")
    private String trailerUrl;

    @DecimalMin(value = "0.0", inclusive = false, message = "Giá vé phải lớn hơn 0")
    @DecimalMax(value = "1000000.0", message = "Giá vé không được vượt quá 1,000,000")
    @Schema(description = "Giá vé", example = "")
    private Double price;

    @Pattern(regexp = "^(COMING_SOON|NOW_SHOWING|ENDED)$", message = "Trạng thái phim không hợp lệ. Chỉ chấp nhận: COMING_SOON, NOW_SHOWING, ENDED")
    @Schema(description = "Trạng thái phim: COMING_SOON (Sắp chiếu), NOW_SHOWING (Đang chiếu), ENDED (Đã kết thúc)", example = "", allowableValues = {
            "COMING_SOON", "NOW_SHOWING", "ENDED" })
    private String status;

    @Schema(description = "Phim nổi bật", example = "")
    private Boolean isFeatured;

    @Schema(description = "Kích hoạt phim", example = "")
    private Boolean isActive;

    @DecimalMin(value = "0.0", message = "Điểm IMDB phải từ 0.0")
    @DecimalMax(value = "10.0", message = "Điểm IMDB không được vượt quá 10.0")
    @Schema(description = "Điểm IMDB", example = "")
    private Double imdbRating;

    @Size(max = 100, message = "Tên công ty sản xuất không được vượt quá 100 ký tự")
    @Schema(description = "Công ty sản xuất. Sử dụng 'CLEAR_FIELD' để xóa", example = "")
    private String productionCompany;

    @Min(value = 0, message = "Ngân sách phải lớn hơn hoặc bằng 0")
    @Schema(description = "Ngân sách sản xuất", example = "")
    private Long budget;

    @Min(value = 0, message = "Doanh thu phải lớn hơn hoặc bằng 0")
    @Schema(description = "Doanh thu phòng vé", example = "")
    private Long boxOffice;

    /**
     * Constant để clear field
     */
    public static final String CLEAR_FIELD = "CLEAR_FIELD";

    /**
     * Helper method để check xem có phải là request clear field không
     */
    public boolean shouldClearField(String value) {
        return CLEAR_FIELD.equals(value);
    }

    /**
     * Validate status với MovieStatus enum
     */
    public boolean isValidStatus() {
        return status == null || MovieStatus.isValid(status);
    }

    /**
     * Get MovieStatus enum từ status string
     */
    public MovieStatus getStatusEnum() {
        return status != null ? MovieStatus.fromCode(status) : null;
    }
}