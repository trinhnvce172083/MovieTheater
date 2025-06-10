package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.user.*;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * User Management Controller
 * REST API endpoints for admin user management operations
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin User Management", description = "Admin APIs for user management and administration")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class UserManagementController {

    private final UserManagementService userManagementService;

    // ==================== CRUD OPERATIONS ====================

    @GetMapping
    @Operation(summary = "Get all users", description = "Get all users with pagination and sorting (Admin only)")
    public ResponseEntity<Page<UserManagementResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            Authentication authentication) {

        log.info("Admin {} is getting all users - page: {}, size: {}",
                authentication.getName(), page, size);

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<UserManagementResponse> users = userManagementService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID", description = "Get detailed user information by ID (Admin only)")
    public ResponseEntity<UserManagementResponse> getUserById(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is getting user details for ID: {}", authentication.getName(), userId);

        UserManagementResponse user = userManagementService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @Operation(summary = "Create new user", description = "Create a new user account (Admin only)")
    public ResponseEntity<UserManagementResponse> createUser(
            @Valid @RequestBody UserManagementRequest request,
            Authentication authentication) {

        log.info("Admin {} is creating new user: {}", authentication.getName(), request.getUsername());

        UserManagementResponse createdUser = userManagementService.createUser(request);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update user", description = "Update user information (Admin only)")
    public ResponseEntity<UserManagementResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserManagementRequest request,
            Authentication authentication) {

        log.info("Admin {} is updating user ID: {}", authentication.getName(), userId);

        UserManagementResponse updatedUser = userManagementService.updateUser(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete user", description = "Soft delete user account (Admin only)")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is deleting user ID: {}", authentication.getName(), userId);

        userManagementService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // ==================== SEARCH & FILTER ====================

    @PostMapping("/search")
    @Operation(summary = "Search users", description = "Search and filter users with advanced criteria (Admin only)")
    public ResponseEntity<Page<UserManagementResponse>> searchUsers(
            @RequestBody UserSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            Authentication authentication) {

        log.info("Admin {} is searching users with keyword: {}",
                authentication.getName(), searchRequest.getKeyword());

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<UserManagementResponse> users = userManagementService.searchUsers(searchRequest, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Get users by role", description = "Get users filtered by role (Admin only)")
    public ResponseEntity<Page<UserManagementResponse>> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("Admin {} is getting users by role: {}", authentication.getName(), role);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserManagementResponse> users = userManagementService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active users", description = "Get all active users (Admin only)")
    public ResponseEntity<Page<UserManagementResponse>> getActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("Admin {} is getting active users", authentication.getName());

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserManagementResponse> users = userManagementService.getActiveUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/locked")
    @Operation(summary = "Get locked accounts", description = "Get all locked user accounts (Admin only)")
    public ResponseEntity<Page<UserManagementResponse>> getLockedAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("Admin {} is getting locked accounts", authentication.getName());

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "accountLockedUntil"));
        Page<UserManagementResponse> users = userManagementService.getLockedAccounts(pageable);
        return ResponseEntity.ok(users);
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    @PostMapping("/{userId}/activate")
    @Operation(summary = "Activate user", description = "Activate user account (Admin only)")
    public ResponseEntity<UserManagementResponse> activateUser(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is activating user ID: {}", authentication.getName(), userId);

        UserManagementResponse user = userManagementService.activateUser(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/deactivate")
    @Operation(summary = "Deactivate user", description = "Deactivate user account (Admin only)")
    public ResponseEntity<UserManagementResponse> deactivateUser(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is deactivating user ID: {}", authentication.getName(), userId);

        UserManagementResponse user = userManagementService.deactivateUser(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/lock")
    @Operation(summary = "Lock user account", description = "Lock user account with reason (Admin only)")
    public ResponseEntity<UserManagementResponse> lockUser(
            @PathVariable Long userId,
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {

        // Validate required fields
        String lockReason = requestBody.get("reason");
        if (lockReason == null || lockReason.trim().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Lock reason is required");
        }

        log.info("Admin {} is locking user ID: {} - reason: {}",
                authentication.getName(), userId, lockReason);

        UserManagementResponse user = userManagementService.lockUser(userId, lockReason);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/unlock")
    @Operation(summary = "Unlock user account", description = "Unlock user account (Admin only)")
    public ResponseEntity<UserManagementResponse> unlockUser(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is unlocking user ID: {}", authentication.getName(), userId);

        UserManagementResponse user = userManagementService.unlockUser(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/verify-email")
    @Operation(summary = "Verify user email", description = "Manually verify user email (Admin only)")
    public ResponseEntity<UserManagementResponse> verifyUserEmail(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is verifying email for user ID: {}", authentication.getName(), userId);

        UserManagementResponse user = userManagementService.verifyUserEmail(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/reset-password")
    @Operation(summary = "Reset user password", description = "Reset user password (Admin only)")
    public ResponseEntity<UserManagementResponse> resetUserPassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {

        // Validate required fields
        String newPassword = requestBody.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "New password is required");
        }

        if (newPassword.length() < 6) {
            throw new AppException(ErrorCode.PASSWORD_INVALID, "Password must be at least 6 characters");
        }

        log.info("Admin {} is resetting password for user ID: {}", authentication.getName(), userId);

        UserManagementResponse user = userManagementService.resetUserPassword(userId, newPassword);
        return ResponseEntity.ok(user);
    }

    // ==================== MEMBERSHIP MANAGEMENT ====================

    @PostMapping("/{userId}/membership/points")
    @Operation(summary = "Update membership points", description = "Add or subtract membership points (Admin only)")
    public ResponseEntity<UserManagementResponse> updateMembershipPoints(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> requestBody,
            Authentication authentication) {

        Integer points = (Integer) requestBody.get("points");
        String reason = (String) requestBody.getOrDefault("reason", "Admin adjustment");

        if (points == null) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Admin {} is adjusting {} points for user ID: {} - reason: {}",
                authentication.getName(), points, userId, reason);

        UserManagementResponse user = userManagementService.updateMembershipPoints(userId, points, reason);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/membership/level")
    @Operation(summary = "Update membership level", description = "Update user membership level (Admin only)")
    public ResponseEntity<UserManagementResponse> updateMembershipLevel(
            @PathVariable Long userId,
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {

        String level = requestBody.get("level");
        if (level == null || level.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Admin {} is updating membership level to {} for user ID: {}",
                authentication.getName(), level, userId);

        UserManagementResponse user = userManagementService.updateMembershipLevel(userId, level);
        return ResponseEntity.ok(user);
    }

    // ==================== STATISTICS & ANALYTICS ====================

    @GetMapping("/statistics")
    @Operation(summary = "Get user statistics", description = "Get comprehensive user statistics (Admin only)")
    public ResponseEntity<UserStatisticsResponse> getUserStatistics(Authentication authentication) {

        log.info("Admin {} is getting user statistics", authentication.getName());

        UserStatisticsResponse statistics = userManagementService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }

    // ==================== EXPORT FUNCTIONS ====================

    @PostMapping("/export/csv")
    @Operation(summary = "Export users to CSV", description = "Export users data to CSV format (Admin only)")
    public ResponseEntity<byte[]> exportUsersToCSV(
            @RequestBody(required = false) UserSearchRequest searchRequest,
            Authentication authentication) {

        log.info("Admin {} is exporting users to CSV", authentication.getName());

        byte[] csvData = userManagementService.exportUsersToCSV(searchRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"users_export.csv\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csvData);
    }

    @PostMapping("/export/excel")
    @Operation(summary = "Export users to Excel", description = "Export users data to Excel format (Admin only)")
    public ResponseEntity<byte[]> exportUsersToExcel(
            @RequestBody(required = false) UserSearchRequest searchRequest,
            Authentication authentication) {

        log.info("Admin {} is exporting users to Excel", authentication.getName());

        byte[] excelData = userManagementService.exportUsersToExcel(searchRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"users_export.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }

    // ==================== BULK OPERATIONS ====================

    @PostMapping("/bulk/activate")
    @Operation(summary = "Bulk activate users", description = "Activate multiple users at once (Admin only)")
    public ResponseEntity<Map<String, Object>> bulkActivateUsers(
            @RequestBody Map<String, List<Long>> requestBody,
            Authentication authentication) {

        // Validate required fields
        List<Long> userIds = requestBody.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "User IDs list is required and cannot be empty");
        }

        if (userIds.size() > 100) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Cannot activate more than 100 users at once");
        }

        log.info("Admin {} is bulk activating {} users", authentication.getName(), userIds.size());

        int activatedCount = userManagementService.bulkActivateUsers(userIds);

        return ResponseEntity.ok(Map.of(
                "message", "Bulk activation completed",
                "totalRequested", userIds.size(),
                "successCount", activatedCount,
                "failedCount", userIds.size() - activatedCount));
    }

    @PostMapping("/bulk/deactivate")
    @Operation(summary = "Bulk deactivate users", description = "Deactivate multiple users at once (Admin only)")
    public ResponseEntity<Map<String, Object>> bulkDeactivateUsers(
            @RequestBody Map<String, List<Long>> requestBody,
            Authentication authentication) {

        List<Long> userIds = requestBody.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Admin {} is bulk deactivating {} users", authentication.getName(), userIds.size());

        int deactivatedCount = userManagementService.bulkDeactivateUsers(userIds);

        return ResponseEntity.ok(Map.of(
                "message", "Bulk deactivation completed",
                "totalRequested", userIds.size(),
                "successCount", deactivatedCount,
                "failedCount", userIds.size() - deactivatedCount));
    }

    @PostMapping("/bulk/delete")
    @Operation(summary = "Bulk delete users", description = "Delete multiple users at once (Admin only)")
    public ResponseEntity<Map<String, Object>> bulkDeleteUsers(
            @RequestBody Map<String, List<Long>> requestBody,
            Authentication authentication) {

        List<Long> userIds = requestBody.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Admin {} is bulk deleting {} users", authentication.getName(), userIds.size());

        int deletedCount = userManagementService.bulkDeleteUsers(userIds);

        return ResponseEntity.ok(Map.of(
                "message", "Bulk deletion completed",
                "totalRequested", userIds.size(),
                "successCount", deletedCount,
                "failedCount", userIds.size() - deletedCount));
    }

    // ==================== VALIDATION ENDPOINTS ====================

    @GetMapping("/check/username")
    @Operation(summary = "Check username availability", description = "Check if username is available (Admin only)")
    public ResponseEntity<Map<String, Boolean>> checkUsernameAvailability(
            @RequestParam String username,
            @RequestParam(required = false) Long excludeUserId,
            Authentication authentication) {

        boolean available = userManagementService.isUsernameAvailable(username, excludeUserId);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/check/email")
    @Operation(summary = "Check email availability", description = "Check if email is available (Admin only)")
    public ResponseEntity<Map<String, Boolean>> checkEmailAvailability(
            @RequestParam String email,
            @RequestParam(required = false) Long excludeUserId,
            Authentication authentication) {

        boolean available = userManagementService.isEmailAvailable(email, excludeUserId);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/check/employee-code")
    @Operation(summary = "Check employee code availability", description = "Check if employee code is available (Admin only)")
    public ResponseEntity<Map<String, Boolean>> checkEmployeeCodeAvailability(
            @RequestParam String employeeCode,
            @RequestParam(required = false) Long excludeUserId,
            Authentication authentication) {

        boolean available = userManagementService.isEmployeeCodeAvailable(employeeCode, excludeUserId);
        return ResponseEntity.ok(Map.of("available", available));
    }
}