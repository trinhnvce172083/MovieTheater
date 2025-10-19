package com.swp.MovieTheaterService.utils;

import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class ImageUtils {
    
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "jpg", "jpeg", "png", "gif", "webp"
    );
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    public static boolean isValidImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        
        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return false;
        }
        
        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return false;
        }
        
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            return false;
        }
        
        // Check file size
        return file.getSize() <= MAX_FILE_SIZE;
    }
    
    public static String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
    
    public static String generateImageFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return System.currentTimeMillis() + "_" + Math.random() + "." + extension;
    }
    
    public static String getValidationMessage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "File không được để trống";
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)";
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            return "File không được vượt quá 5MB";
        }
        
        return "File hợp lệ";
    }
} 
