package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.user.*;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.dto.response.PageResponse;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.service.ImageManagementService;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;

/**
 * User Management Controller
 * REST API endpoints for admin user management operations
 * 
 * @author Ngo Viet Trinh
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
    private final ImageManagementService imageManagementService;

    // ==================== CRUD OPERATIONS ====================

    @GetMapping
    @Operation(summary = "Get all users", description = "Get all users with pagination and sorting (Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<UserManagementResponse>>> getAllUsers(
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
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", PageResponse.of(users)));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID", description = "Get detailed user information by ID (Admin only)")
    public ResponseEntity<ApiResponse<UserManagementResponse>> getUserById(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is getting user details for ID: {}", authentication.getName(), userId);

        UserManagementResponse user = userManagementService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", user));
    }

    @PostMapping
    @Operation(summary = "Create new user", description = "Create a new user account (Admin only)")
    public ResponseEntity<ApiResponse<UserManagementResponse>> createUser(
            @Valid @RequestBody UserManagementRequest request,
            Authentication authentication) {

        log.info("Admin {} is creating new user: {}", authentication.getName(), request.getUsername());

        UserManagementResponse createdUser = userManagementService.createUser(request);
        return ResponseEntity.status(201).body(ApiResponse.success("Tạo người dùng thành công", createdUser));
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update user", description = "Update user information (Admin only)")
    public ResponseEntity<ApiResponse<UserManagementResponse>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserManagementRequest request,
            Authentication authentication) {

        log.info("Admin {} is updating user ID: {}", authentication.getName(), userId);

        UserManagementResponse updatedUser = userManagementService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", updatedUser));
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete user", description = "Soft delete user account (Admin only)")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is deleting user ID: {}", authentication.getName(), userId);

        userManagementService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công", null));
    }

    // ==================== AVATAR MANAGEMENT ====================

    @PostMapping(value = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload user avatar", description = "Upload avatar image for user (Admin only)")
    public ResponseEntity<Map<String, Object>> uploadUserAvatar(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        log.info("Admin {} is uploading avatar for user ID: {}", authentication.getName(), userId);

        Map<String, Object> response = new HashMap<>();
        
        try {
            String newAvatarUrl = imageManagementService.updateAccountAvatar(userId, file);
            
            response.put("success", true);
            response.put("message", "Upload avatar thành công");
            response.put("avatarUrl", newAvatarUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to upload avatar for user ID: {}", userId, e);
            response.put("success", false);
            response.put("message", "Upload avatar thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{userId}/avatar")
    @Operation(summary = "Delete user avatar", description = "Delete avatar image of user (Admin only)")
    public ResponseEntity<Map<String, Object>> deleteUserAvatar(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is deleting avatar for user ID: {}", authentication.getName(), userId);

        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = imageManagementService.deleteAccountAvatar(userId);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Xóa avatar thành công");
            } else {
                response.put("success", false);
                response.put("message", "Không thể xóa avatar");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to delete avatar for user ID: {}", userId, e);
            response.put("success", false);
            response.put("message", "Xóa avatar thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== SEARCH & FILTER ====================

    @PostMapping("/search")
    @Operation(summary = "Search users", description = "Search and filter users with advanced criteria (Admin only)")
    public ResponseEntity<PageResponse<UserManagementResponse>> searchUsers(
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
        return ResponseEntity.ok(PageResponse.of(users));
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Get users by role", description = "Get users filtered by role (Admin only)")
    public ResponseEntity<PageResponse<UserManagementResponse>> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("Admin {} is getting users by role: {}", authentication.getName(), role);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserManagementResponse> users = userManagementService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(PageResponse.of(users));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active users", description = "Get all active users (Admin only)")
    public ResponseEntity<PageResponse<UserManagementResponse>> getActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("Admin {} is getting active users", authentication.getName());

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserManagementResponse> users = userManagementService.getActiveUsers(pageable);
        return ResponseEntity.ok(PageResponse.of(users));
    }

    @GetMapping("/locked")
    @Operation(summary = "Get locked accounts", description = "Get all locked user accounts (Admin only)")
    public ResponseEntity<PageResponse<UserManagementResponse>> getLockedAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("Admin {} is getting locked accounts", authentication.getName());

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "accountLockedUntil"));
        Page<UserManagementResponse> users = userManagementService.getLockedAccounts(pageable);
        return ResponseEntity.ok(PageResponse.of(users));
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
    @Operation(summary = "Lock user account", description = "Lock user account with detailed reason and duration (Admin only)")
    public ResponseEntity<UserManagementResponse> lockUser(
            @PathVariable Long userId,
            @Valid @RequestBody LockUserRequest lockRequest,
            Authentication authentication) {

        log.info("Admin {} is locking user ID: {} - reason: {} - hours: {}",
                authentication.getName(), userId, lockRequest.getReason(), lockRequest.getLockHours());

        UserManagementResponse user = userManagementService.lockUser(userId, lockRequest);
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
    @Operation(summary = "Update membership points", description = "Add or subtract membership points with detailed tracking (Admin only)")
    public ResponseEntity<UserManagementResponse> updateMembershipPoints(
            @PathVariable Long userId,
            @Valid @RequestBody MembershipPointsRequest request,
            Authentication authentication) {

        log.info("Admin {} is adjusting {} points for user ID: {} - reason: {}",
                authentication.getName(), request.getPoints(), userId, request.getReason());

        UserManagementResponse user = userManagementService.updateMembershipPoints(userId, request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/membership/level")
    @Operation(summary = "Update membership level", description = "Update user membership level with detailed tracking (Admin only)")
    public ResponseEntity<UserManagementResponse> updateMembershipLevel(
            @PathVariable Long userId,
            @Valid @RequestBody MembershipLevelRequest request,
            Authentication authentication) {

        log.info("Admin {} is updating membership level to {} for user ID: {} - reason: {}",
                authentication.getName(), request.getLevel(), userId, request.getReason());

        UserManagementResponse user = userManagementService.updateMembershipLevel(userId, request);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/membership/levels")
    @Operation(summary = "Get membership levels info", description = "Get all membership levels with requirements and benefits (Admin only)")
    public ResponseEntity<Map<String, Object>> getMembershipLevelsInfo(Authentication authentication) {

        log.info("Admin {} is getting membership levels information", authentication.getName());

        Map<String, Object> levelInfo = userManagementService.getMembershipLevelInfo();
        return ResponseEntity.ok(levelInfo);
    }

    @GetMapping("/{userId}/membership/recommendation")
    @Operation(summary = "Get membership level recommendation", description = "Get recommended membership level for user (Admin only)")
    public ResponseEntity<Map<String, Object>> getMembershipRecommendation(
            @PathVariable Long userId,
            Authentication authentication) {

        log.info("Admin {} is getting membership recommendation for user ID: {}", authentication.getName(), userId);

        Map<String, Object> recommendation = userManagementService.calculateRecommendedMembershipLevel(userId);
        return ResponseEntity.ok(recommendation);
    }

    @GetMapping("/{userId}/membership/points/history")
    @Operation(summary = "Get membership points history", description = "Get membership points transaction history for user (Admin only)")
    public ResponseEntity<PageResponse<Map<String, Object>>> getMembershipPointsHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("Admin {} is getting points history for user ID: {}", authentication.getName(), userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Map<String, Object>> history = userManagementService.getMembershipPointsHistory(userId, pageable);
        return ResponseEntity.ok(PageResponse.of(history));
    }

    @GetMapping("/search/options")
    @Operation(summary = "Get search options", description = "Get available sort fields and directions for user search (Admin only)")
    public ResponseEntity<Map<String, Object>> getSearchOptions(Authentication authentication) {

        Map<String, Object> options = new HashMap<>();

        // Sort fields với mô tả tiếng Việt
        Map<String, String> sortFields = new LinkedHashMap<>();
        sortFields.put("createdAt", "Ngày tạo tài khoản");
        sortFields.put("updatedAt", "Ngày cập nhật cuối");
        sortFields.put("username", "Tên đăng nhập");
        sortFields.put("email", "Địa chỉ email");
        sortFields.put("fullName", "Họ và tên");
        sortFields.put("lastLogin", "Lần đăng nhập cuối");
        sortFields.put("membershipPoints", "Điểm thành viên");
        sortFields.put("membershipLevel", "Cấp độ thành viên");
        sortFields.put("totalBookings", "Tổng số lượt đặt vé");
        sortFields.put("totalSpent", "Tổng số tiền đã chi");
        sortFields.put("dateOfBirth", "Ngày sinh");
        sortFields.put("salary", "Lương (nhân viên)");
        sortFields.put("employeeCode", "Mã nhân viên");
        sortFields.put("department", "Phòng ban");
        sortFields.put("isActive", "Trạng thái hoạt động");
        sortFields.put("isVerified", "Trạng thái xác thực");
        sortFields.put("emailVerified", "Trạng thái xác thực email");
        sortFields.put("failedLoginAttempts", "Số lần đăng nhập thất bại");
        sortFields.put("accountLockedUntil", "Thời gian khóa tài khoản");

        // Sort directions
        Map<String, String> sortDirections = new LinkedHashMap<>();
        sortDirections.put("ASC", "Sắp xếp tăng dần");
        sortDirections.put("DESC", "Sắp xếp giảm dần");

        // Membership levels
        Map<String, String> membershipLevels = new LinkedHashMap<>();
        membershipLevels.put("BRONZE", "Đồng");
        membershipLevels.put("SILVER", "Bạc");
        membershipLevels.put("GOLD", "Vàng");
        membershipLevels.put("PLATINUM", "Bạch kim");

        // User roles
        Map<String, String> userRoles = new LinkedHashMap<>();
        userRoles.put("CUSTOMER", "Khách hàng");
        userRoles.put("EMPLOYEE", "Nhân viên");
        userRoles.put("ADMIN", "Quản trị viên");

        // Search modes
        Map<String, String> searchModes = new LinkedHashMap<>();
        searchModes.put("CONTAINS", "Tìm kiếm gần đúng");
        searchModes.put("EXACT", "Tìm kiếm chính xác");

        options.put("sortFields", sortFields);
        options.put("sortDirections", sortDirections);
        options.put("membershipLevels", membershipLevels);
        options.put("userRoles", userRoles);
        options.put("searchModes", searchModes);
        options.put("defaultSortBy", "createdAt");
        options.put("defaultSortDirection", "DESC");
        options.put("defaultPageSize", 20);
        options.put("maxPageSize", 100);

        return ResponseEntity.ok(options);
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