package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.service.ImageManagementService;
import com.swp.MovieTheaterService.utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@CrossOrigin
public class ImageController {
    
    private final ImageManagementService imageManagementService;
    
    // =============== MOVIE IMAGE ENDPOINTS ===============
    
    @PostMapping("/movies/{movieId}/poster")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<String>> updateMoviePoster(
            @PathVariable Long movieId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (!ImageUtils.isValidImageFile(file)) {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(false)
                        .message(ImageUtils.getValidationMessage(file))
                        .build();
                return ResponseEntity.badRequest().body(apiResponse);
            }
            
            String newPosterUrl = imageManagementService.updateMoviePoster(movieId, file);

            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("Cập nhật poster phim thành công")
                    .data(newPosterUrl)
                    .build();

            return ResponseEntity.ok(apiResponse);
            
        } catch (Exception e) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.internalServerError().body(apiResponse);
        }
    }
    
    @PostMapping("/movies/{movieId}/backdrop")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<String>> updateMovieBackdrop(
            @PathVariable Long movieId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (!ImageUtils.isValidImageFile(file)) {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(false)
                        .message(ImageUtils.getValidationMessage(file))
                        .build();
                return ResponseEntity.badRequest().body(apiResponse);
            }
            
            String newBackdropUrl = imageManagementService.updateMovieBackdrop(movieId, file);

            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("Cập nhật backdrop phim thành công")
                    .data(newBackdropUrl)
                    .build();

            return ResponseEntity.ok(apiResponse);
            
        } catch (Exception e) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.internalServerError().body(apiResponse);
        }
    }
    
    @DeleteMapping("/movies/{movieId}/poster")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<String>> deleteMoviePoster(@PathVariable Long movieId) {
        try {
            boolean deleted = imageManagementService.deleteMoviePoster(movieId);
            
            if (deleted) {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(true)
                        .message("Xóa poster phim thành công")
                        .data("Poster đã được xóa")
                        .build();
                return ResponseEntity.ok(apiResponse);
            } else {
                ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                        .success(false)
                        .message("Không thể xóa poster phim")
                        .build();
                return ResponseEntity.badRequest().body(apiResponse);
            }
            
        } catch (Exception e) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.internalServerError().body(apiResponse);
        }
    }
    
    @DeleteMapping("/movies/{movieId}/backdrop")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Map<String, Object>> deleteMovieBackdrop(@PathVariable Long movieId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = imageManagementService.deleteMovieBackdrop(movieId);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Xóa backdrop phim thành công");
            } else {
                response.put("success", false);
                response.put("message", "Không thể xóa backdrop phim");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // =============== ACCOUNT IMAGE ENDPOINTS ===============
    
    @PostMapping("/accounts/{accountId}/avatar")
    public ResponseEntity<Map<String, Object>> updateAccountAvatar(
            @PathVariable Long accountId,
            @RequestParam("file") MultipartFile file) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (!ImageUtils.isValidImageFile(file)) {
                response.put("success", false);
                response.put("message", ImageUtils.getValidationMessage(file));
                return ResponseEntity.badRequest().body(response);
            }
            
            String newAvatarUrl = imageManagementService.updateAccountAvatar(accountId, file);
            
            response.put("success", true);
            response.put("message", "Cập nhật avatar thành công");
            response.put("url", newAvatarUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @DeleteMapping("/accounts/{accountId}/avatar")
    public ResponseEntity<Map<String, Object>> deleteAccountAvatar(@PathVariable Long accountId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = imageManagementService.deleteAccountAvatar(accountId);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Xóa avatar thành công");
            } else {
                response.put("success", false);
                response.put("message", "Không thể xóa avatar");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}