package com.swp.MovieTheaterService.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Custom Page Response DTO
 * Thay thế PageImpl để tránh warning serialization
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Paginated response wrapper")
public class PageResponse<T> {

    @Schema(description = "Content của trang hiện tại")
    private List<T> content;

    @Schema(description = "Thông tin phân trang")
    private PageInfo page;

    /**
     * Tạo PageResponse từ Spring Data Page
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(PageInfo.builder()
                        .number(page.getNumber())
                        .size(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .first(page.isFirst())
                        .last(page.isLast())
                        .empty(page.isEmpty())
                        .numberOfElements(page.getNumberOfElements())
                        .build())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Thông tin phân trang")
    public static class PageInfo {
        @Schema(description = "Số trang hiện tại (0-based)", example = "0")
        private int number;

        @Schema(description = "Kích thước trang", example = "20")
        private int size;

        @Schema(description = "Tổng số phần tử", example = "100")
        private long totalElements;

        @Schema(description = "Tổng số trang", example = "5")
        private int totalPages;

        @Schema(description = "Có phải trang đầu tiên", example = "true")
        private boolean first;

        @Schema(description = "Có phải trang cuối cùng", example = "false")
        private boolean last;

        @Schema(description = "Trang có rỗng không", example = "false")
        private boolean empty;

        @Schema(description = "Số phần tử trong trang hiện tại", example = "20")
        private int numberOfElements;
    }
}
