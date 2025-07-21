package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.service.SupabaseStorageService;
import com.swp.MovieTheaterService.utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin
public class FileUploadController {
    
    private final SupabaseStorageService supabaseStorageService;
    
    @PostMapping("/upload/{folder}")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable String folder) {
        
        try {
            String imageUrl = supabaseStorageService.uploadFile(file, folder);

            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("Upload file thành công")
                    .data(imageUrl)
                    .build();

            return ResponseEntity.ok(apiResponse);
            
        } catch (Exception e) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message("Upload thất bại: " + e.getMessage())
                    .build();

            return ResponseEntity.badRequest().body(apiResponse);
        }
    }
    
    @DeleteMapping("/delete/{fileName}")
    public ResponseEntity<ApiResponse<String>> deleteFile(@PathVariable String fileName) {
        try {
            boolean isDeleted = supabaseStorageService.deleteFile(fileName);
            if (isDeleted) {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(true)
                        .message("Xóa file thành công")
                        .data("File đã được xóa")
                        .build();
                return ResponseEntity.ok(apiResponse);
            } else {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(false)
                        .message("Không thể xóa file")
                        .build();
                return ResponseEntity.badRequest().body(apiResponse);
            }
        } catch (Exception e) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi xóa file: " + e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<String>> deleteFileByUrl(@RequestParam String url) {
        try {
            boolean isDeleted = supabaseStorageService.deleteFile(url);
            if (isDeleted) {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(true)
                        .message("Xóa file thành công")
                        .data("File đã được xóa")
                        .build();
                return ResponseEntity.ok(apiResponse);
            } else {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(false)
                        .message("Không thể xóa file")
                        .build();
                return ResponseEntity.badRequest().body(apiResponse);
            }
        } catch (Exception e) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi xóa file: " + e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }
    
    @PostMapping("/replace/{folder}")
    public ResponseEntity<ApiResponse<String>> replaceFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "oldUrl", required = false) String oldUrl,
            @PathVariable String folder) {
        
        try {
            String newImageUrl = supabaseStorageService.replaceFile(oldUrl, file, folder);

            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("Thay thế file thành công")
                    .data(newImageUrl)
                    .build();

            return ResponseEntity.ok(apiResponse);
            
        } catch (Exception e) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi thay thế file: " + e.getMessage())
                    .build();

            return ResponseEntity.internalServerError().body(apiResponse);
        }
    }
} 