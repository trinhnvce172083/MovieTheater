package com.swp.MovieTheaterService.dto.movie;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Movie Create Request DTO
 * Data transfer object for creating new movies
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieCreateRequest {

    @NotBlank(message = "Tiêu đề phim không được để trống")
    @Size(min = 1, max = 200, message = "Tiêu đề phim phải từ 1-200 ký tự")
    private String title;

    @NotBlank(message = "Mô tả phim không được để trống")
    @Size(min = 10, max = 2000, message = "Mô tả phim phải từ 10-2000 ký tự")
    private String description;

    @NotNull(message = "Thời lượng phim không được để trống")
    @Min(value = 1, message = "Thời lượng phim phải lớn hơn 0 phút")
    @Max(value = 600, message = "Thời lượng phim không được vượt quá 600 phút")
    private Integer duration;

    @NotBlank(message = "Thể loại phim không được để trống")
    @Size(max = 100, message = "Thể loại phim không được vượt quá 100 ký tự")
    private String genre;

    @Size(max = 100, message = "Tên đạo diễn không được vượt quá 100 ký tự")
    private String director;

    @Size(max = 1000, message = "Danh sách diễn viên không được vượt quá 1000 ký tự")
    private String cast;

    @Size(max = 50, message = "Ngôn ngữ không được vượt quá 50 ký tự")
    private String language;

    @Size(max = 50, message = "Quốc gia không được vượt quá 50 ký tự")
    private String country;

    private LocalDate releaseDate;

    @Pattern(regexp = "^(G|PG|PG-13|R|NC-17)$", message = "Xếp hạng phim không hợp lệ (G, PG, PG-13, R, NC-17)")
    private String rating;

    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|webp)$", message = "URL poster phải là đường dẫn hợp lệ đến file ảnh")
    private String posterUrl;

    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|webp)$", message = "URL backdrop phải là đường dẫn hợp lệ đến file ảnh")
    private String backdropUrl;

    @Pattern(regexp = "^(https?://).*", message = "URL trailer phải là đường dẫn hợp lệ")
    private String trailerUrl;

    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá vé phải lớn hơn 0")
    @DecimalMax(value = "1000000.0", message = "Giá vé không được vượt quá 1,000,000")
    private Double price;

    @Pattern(regexp = "^(COMING_SOON|NOW_SHOWING|ENDED)$",
            message = "Trạng thái phim không hợp lệ (COMING_SOON, NOW_SHOWING, ENDED)")
    private String status = "COMING_SOON";

    private Boolean isFeatured = false;

    @DecimalMin(value = "0.0", message = "Điểm IMDB phải từ 0.0")
    @DecimalMax(value = "10.0", message = "Điểm IMDB không được vượt quá 10.0")
    private Double imdbRating;

    @Size(max = 100, message = "Tên công ty sản xuất không được vượt quá 100 ký tự")
    private String productionCompany;

    @Min(value = 0, message = "Ngân sách phải lớn hơn hoặc bằng 0")
    private Long budget;

    @Min(value = 0, message = "Doanh thu phải lớn hơn hoặc bằng 0")
    private Long boxOffice;
} 
