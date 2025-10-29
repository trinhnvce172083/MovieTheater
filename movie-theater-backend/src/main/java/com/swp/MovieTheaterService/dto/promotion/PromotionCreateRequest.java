package com.swp.MovieTheaterService.dto.promotion;

import lombok.Data;
import jakarta.validation.constraints.*;
import com.swp.MovieTheaterService.enums.DiscountType;

/**
 * Promotion Create Request DTO
 * Data transfer object for creating promotions
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
public class PromotionCreateRequest {

    @NotBlank(message = "Mã khuyến mãi không được để trống")
    @Size(min = 3, max = 20, message = "Mã khuyến mãi phải từ 3-20 ký tự")
    private String code;

    @NotBlank(message = "Tên khuyến mãi không được để trống")
    @Size(min = 2, max = 100, message = "Tên khuyến mãi phải từ 2-100 ký tự")
    private String name;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @Positive(message = "Giá trị giảm giá phải lớn hơn 0")
    private Double discountValue;

    @PositiveOrZero(message = "Số tiền giảm tối đa phải lớn hơn hoặc bằng 0")
    private Double maxDiscountAmount;

    @PositiveOrZero(message = "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0")
    private Double minPurchaseAmount;

    @NotBlank(message = "Ngày bắt đầu không được để trống")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Định dạng ngày phải là yyyy-MM-dd")
    private String startDate;

    @NotBlank(message = "Ngày kết thúc không được để trống")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Định dạng ngày phải là yyyy-MM-dd")
    private String endDate;

    @NotNull(message = "Số lần sử dụng tối đa không được để trống")
    @Positive(message = "Số lần sử dụng tối đa phải lớn hơn 0")
    private Integer maxUsageCount;

    @NotNull(message = "Số lần sử dụng tối đa mỗi user không được để trống")
    @Positive(message = "Số lần sử dụng tối đa mỗi user phải lớn hơn 0")
    private Integer maxUsagePerUser;

    private Boolean isFeatured = false;

    private String bannerImageUrl;

    @PositiveOrZero(message = "Số điểm yêu cầu phải lớn hơn hoặc bằng 0")
    private Integer pointsRequired = 0;

    @Positive(message = "Thời gian hiệu lực code phải lớn hơn 0")
    private Integer codeValidityHour = 24;
}