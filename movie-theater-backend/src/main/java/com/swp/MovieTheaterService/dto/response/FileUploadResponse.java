package com.swp.MovieTheaterService.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private boolean success;
    private String message;
    private String url;
    private String fileName;
    private Long fileSize;
    private String contentType;
} 
