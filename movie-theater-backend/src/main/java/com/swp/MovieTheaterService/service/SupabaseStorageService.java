package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.config.SupabaseConfig;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService {
    
    private final SupabaseConfig supabaseConfig;
    private final OkHttpClient okHttpClient;
    
    /**
     * Upload file lên Supabase Storage
     */
    public String uploadFile(MultipartFile file, String folder) {
        // Validate file trước
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }
        
        if (!ImageUtils.isValidImageFile(file)) {
            throw new AppException(ErrorCode.FILE_TYPE_NOT_SUPPORTED);
        }
        
        try {
            String fileName = generateFileName(file.getOriginalFilename());
            String filePath = folder + "/" + fileName;
            
            RequestBody fileBody = RequestBody.create(
                file.getBytes(),
                MediaType.parse(file.getContentType())
            );
            
            String uploadUrl = supabaseConfig.getUrl() + "/storage/v1/object/" + 
                              supabaseConfig.getBucket() + "/" + filePath;
            
            Request request = new Request.Builder()
                .url(uploadUrl)
                .post(fileBody)
                .addHeader("Authorization", "Bearer " + supabaseConfig.getKey())
                .addHeader("Content-Type", file.getContentType())
                .build();
            
            try (Response response = okHttpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorMsg = response.body() != null ? response.body().string() : "Unknown error";
                    log.error("Upload failed: {}", errorMsg);
                    throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
                }
                return getPublicUrl(filePath);
            }
        } catch (IOException e) {
            log.error("IO error during file upload: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_STORAGE_SERVICE_ERROR, e);
        }
    }
    
    /**
     * Xóa file từ Supabase Storage
     */
    public boolean deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE_URL);
        }
        
        // Nếu là full URL, extract file path
        if (filePath.contains(supabaseConfig.getUrl())) {
            filePath = extractFilePathFromUrl(filePath);
        }
        
        String deleteUrl = supabaseConfig.getUrl() + "/storage/v1/object/" + 
                          supabaseConfig.getBucket() + "/" + filePath;
        
        Request request = new Request.Builder()
            .url(deleteUrl)
            .delete()
            .addHeader("Authorization", "Bearer " + supabaseConfig.getKey())
            .build();
        
        try (Response response = okHttpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorMsg = response.body() != null ? response.body().string() : "Unknown error";
                log.error("Delete failed: {}", errorMsg);
                throw new AppException(ErrorCode.FILE_DELETE_FAILED);
            }
            return true;
        } catch (IOException e) {
            log.error("IO error during file deletion: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_STORAGE_SERVICE_ERROR, e);
        }
    }
    
    /**
     * Lấy URL public của file
     */
    public String getPublicUrl(String filePath) {
        return supabaseConfig.getUrl() + "/storage/v1/object/public/" + 
               supabaseConfig.getBucket() + "/" + filePath;
    }
    
    /**
     * Kiểm tra file có tồn tại không
     */
    public boolean fileExists(String fileName) {
        String imageUrl = getPublicUrl(fileName);
        
        Request request = new Request.Builder()
            .url(imageUrl)
            .head()
            .build();
        
        try (Response response = okHttpClient.newCall(request).execute()) {
            return response.isSuccessful();
        } catch (IOException e) {
            log.warn("Error checking file existence: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Lấy URL ảnh, trả về default nếu không tồn tại
     */
    public String getImageUrl(String fileName) {
        String imageUrl = getPublicUrl(fileName);
        
        if (fileExists(fileName)) {
            return imageUrl;
        } else {
            log.info("Image not exist: {}", fileName);
            return getPublicUrl("default.jpg"); // Default image
        }
    }
    
    /**
     * Trích xuất file path từ URL
     */
    public String extractFilePathFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        String prefix = supabaseConfig.getUrl() + "/storage/v1/object/public/" + 
                       supabaseConfig.getBucket() + "/";
        
        return url.startsWith(prefix) ? url.substring(prefix.length()) : url;
    }
    
    /**
     * Thay thế file cũ bằng file mới
     */
    public String replaceFile(String oldImageUrl, MultipartFile newFile, String folder) {
        // Xóa file cũ nếu tồn tại
        if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
            try {
                deleteFile(oldImageUrl);
            } catch (AppException e) {
                log.warn("Failed to delete old file: {}", e.getMessage());
            }
        }
        
        // Upload file mới
        return uploadFile(newFile, folder);
    }
    
    /**
     * Tạo tên file unique
     */
    private String generateFileName(String originalFilename) {
        String extension = ImageUtils.getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + 
               (extension.isEmpty() ? "" : "." + extension);
    }
}