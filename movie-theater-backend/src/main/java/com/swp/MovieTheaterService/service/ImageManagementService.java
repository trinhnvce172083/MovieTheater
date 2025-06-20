package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Movie;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.repository.MovieRepository;
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
} 