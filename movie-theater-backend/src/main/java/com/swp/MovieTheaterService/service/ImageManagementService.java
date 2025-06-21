package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.entity.Movie;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.repository.ConcessionRepository;
import com.swp.MovieTheaterService.repository.MovieRepository;
import com.swp.MovieTheaterService.repository.PromotionRepository;
import com.swp.MovieTheaterService.dto.response.FileUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageManagementService {
    
    private final SupabaseStorageService supabaseStorageService;
    private final MovieRepository movieRepository;
    private final AccountRepository accountRepository;
    private final ConcessionRepository concessionRepository;
    private final PromotionRepository promotionRepository;
    
    /**
     * Cập nhật poster cho movie
     */
    @Transactional
    public String updateMoviePoster(Long movieId, MultipartFile posterFile) {
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        
        String newPosterUrl = supabaseStorageService.replaceFile(
            movie.getPosterUrl(), 
            posterFile, 
            "movies/posters"
        );
        
        movie.setPosterUrl(newPosterUrl);
        movieRepository.save(movie);
        
        return newPosterUrl;
    }
    
    /**
     * Cập nhật backdrop cho movie
     */
    @Transactional
    public String updateMovieBackdrop(Long movieId, MultipartFile backdropFile) {
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        
        String newBackdropUrl = supabaseStorageService.replaceFile(
            movie.getBackdropUrl(), 
            backdropFile, 
            "movies/backdrops"
        );
        
        movie.setBackdropUrl(newBackdropUrl);
        movieRepository.save(movie);
        
        return newBackdropUrl;
    }
    
    /**
     * Cập nhật avatar cho account
     */
    @Transactional
    public String updateAccountAvatar(Long accountId, MultipartFile avatarFile) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        String newAvatarUrl = supabaseStorageService.replaceFile(
            account.getAvatarUrl(), 
            avatarFile, 
            "accounts/avatars"
        );
        
        account.setAvatarUrl(newAvatarUrl);
        accountRepository.save(account);
        
        return newAvatarUrl;
    }
    
    /**
     * Xóa poster của movie
     */
    @Transactional
    public boolean deleteMoviePoster(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        
        if (movie.getPosterUrl() != null) {
            String filePath = supabaseStorageService.extractFilePathFromUrl(movie.getPosterUrl());
            boolean deleted = supabaseStorageService.deleteFile(filePath);
            
            if (deleted) {
                movie.setPosterUrl(null);
                movieRepository.save(movie);
            }
            
            return deleted;
        }
        
        return true;
    }
    
        /**
     * Xóa backdrop của movie
     */
    @Transactional
    public boolean deleteMovieBackdrop(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        
        if (movie.getBackdropUrl() != null) {
            String filePath = supabaseStorageService.extractFilePathFromUrl(movie.getBackdropUrl());
            boolean deleted = supabaseStorageService.deleteFile(filePath);
            
            if (deleted) {
                movie.setBackdropUrl(null);
                movieRepository.save(movie);
            }
            
            return deleted;
        }
        
        return true;
    }

    /**
     * Xóa avatar của account
     */
    @Transactional
    public boolean deleteAccountAvatar(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        if (account.getAvatarUrl() != null) {
            String filePath = supabaseStorageService.extractFilePathFromUrl(account.getAvatarUrl());
            boolean deleted = supabaseStorageService.deleteFile(filePath);
            
            if (deleted) {
                account.setAvatarUrl(null);
                accountRepository.save(account);
            }
            
            return deleted;
        }
        
        return true;
    }

    // ==================== CONCESSION IMAGE MANAGEMENT ====================
    
    /**
     * Update concession image
     */
    @Transactional
    public String updateConcessionImage(Long concessionId, MultipartFile imageFile) {
        log.info("Updating image for concession ID: {}", concessionId);
        
        Concession concession = concessionRepository.findById(concessionId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        String newImageUrl = supabaseStorageService.replaceFile(
            concession.getImageUrl(), 
            imageFile, 
            "concessions/images"
        );
        
        concession.setImageUrl(newImageUrl);
        concessionRepository.save(concession);
        
        log.info("Updated image for concession: {} - new URL: {}", concession.getName(), newImageUrl);
        return newImageUrl;
    }
    
    /**
     * Delete concession image
     */
    @Transactional
    public boolean deleteConcessionImage(Long concessionId) {
        log.info("Deleting image for concession ID: {}", concessionId);
        
        Concession concession = concessionRepository.findById(concessionId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        if (concession.getImageUrl() != null) {
            String filePath = supabaseStorageService.extractFilePathFromUrl(concession.getImageUrl());
            boolean deleted = supabaseStorageService.deleteFile(filePath);
            
            if (deleted) {
                concession.setImageUrl(null);
                concessionRepository.save(concession);
                log.info("Deleted image for concession: {}", concession.getName());
            }
            
            return deleted;
        }
        
        log.info("No image to delete for concession: {}", concession.getName());
        return true;
    }

    // ==================== PROMOTION IMAGE MANAGEMENT ====================
    
    /**
     * Upload/Update promotion banner
     */
    @Transactional
    public FileUploadResponse updatePromotionBanner(Long promotionId, MultipartFile bannerFile) {
        log.info("Updating banner for promotion ID: {}", promotionId);
        
        Promotion promotion = promotionRepository.findById(promotionId)
            .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        try {
            String newBannerUrl = supabaseStorageService.replaceFile(
                promotion.getBannerUrl(), 
                bannerFile, 
                "promotions/banners"
            );
            
            promotion.setBannerUrl(newBannerUrl);
            promotionRepository.save(promotion);
            
            log.info("Updated banner for promotion: {} - new URL: {}", promotion.getPromotionName(), newBannerUrl);
            
            return FileUploadResponse.builder()
                .fileName(bannerFile.getOriginalFilename())
                .url(newBannerUrl)
                .fileSize(bannerFile.getSize())
                .contentType(bannerFile.getContentType())
                .success(true)
                .message("Banner uploaded successfully")
                .build();
                
        } catch (Exception e) {
            log.error("Error updating banner for promotion {}: {}", promotionId, e.getMessage());
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }
    
    /**
     * Delete promotion banner
     */
    @Transactional
    public boolean deletePromotionBanner(Long promotionId) {
        log.info("Deleting banner for promotion ID: {}", promotionId);
        
        Promotion promotion = promotionRepository.findById(promotionId)
            .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        if (promotion.getBannerUrl() != null) {
            String filePath = supabaseStorageService.extractFilePathFromUrl(promotion.getBannerUrl());
            boolean deleted = supabaseStorageService.deleteFile(filePath);
            
            if (deleted) {
                promotion.setBannerUrl(null);
                promotionRepository.save(promotion);
                log.info("Deleted banner for promotion: {}", promotion.getPromotionName());
            }
            
            return deleted;
        }
        
        log.info("No banner to delete for promotion: {}", promotion.getPromotionName());
        return true;
    }
    
    /**
     * Get promotion banner URL
     */
    public String getPromotionBannerUrl(Long promotionId) {
        log.info("Getting banner URL for promotion ID: {}", promotionId);
        
        Promotion promotion = promotionRepository.findById(promotionId)
            .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        return promotion.getBannerUrl();
    }
    
    /**
     * Check if promotion has banner
     */
    public boolean hasPromotionBanner(Long promotionId) {
        log.info("Checking if promotion {} has banner", promotionId);
        
        Promotion promotion = promotionRepository.findById(promotionId)
            .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        return promotion.getBannerUrl() != null && !promotion.getBannerUrl().trim().isEmpty();
    }
}