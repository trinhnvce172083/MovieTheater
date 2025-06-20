package com.swp.MovieTheaterService.controller;

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
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable String folder) {
        
        try {
            String imageUrl = supabaseStorageService.uploadFile(file, folder);
            return ResponseEntity.ok(imageUrl);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload thất bại: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/delete/{fileName}")
    public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
        try {
            boolean isDeleted = supabaseStorageService.deleteFile(fileName);
            if (isDeleted) {
                return ResponseEntity.ok("Xóa file thành công");
            } else {
                return ResponseEntity.badRequest().body("Không thể xóa file");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa file: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFileByUrl(@RequestParam String url) {
        try {
            boolean isDeleted = supabaseStorageService.deleteFile(url);
            if (isDeleted) {
                return ResponseEntity.ok("Xóa file thành công");
            } else {
                return ResponseEntity.badRequest().body("Không thể xóa file");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa file: " + e.getMessage());
        }
    }
    
    @PostMapping("/replace/{folder}")
    public ResponseEntity<Map<String, Object>> replaceFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "oldUrl", required = false) String oldUrl,
            @PathVariable String folder) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String newImageUrl = supabaseStorageService.replaceFile(oldUrl, file, folder);
            
            response.put("success", true);
            response.put("message", "Thay thế file thành công");
            response.put("url", newImageUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi thay thế file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 