package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.user.*;
import com.swp.MovieTheaterService.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * User Management Service Interface
 * Business logic for admin user management operations
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface UserManagementService {

    // ==================== CRUD OPERATIONS ====================

    /**
     * Get all users with pagination
     * 
     * @param pageable pagination info
     * @return paginated user list
     */
    Page<UserManagementResponse> getAllUsers(Pageable pageable);

    /**
     * Get user by ID
     * 
     * @param userId user ID
     * @return user details
     */
    UserManagementResponse getUserById(Long userId);

    /**
     * Create new user
     * 
     * @param request user creation request
     * @return created user details
     */
    UserManagementResponse createUser(UserManagementRequest request);

    /**
     * Update user
     * 
     * @param userId  user ID
     * @param request user update request
     * @return updated user details
     */
    UserManagementResponse updateUser(Long userId, UserManagementRequest request);

    /**
     * Delete user (soft delete)
     * 
     * @param userId user ID
     */
    void deleteUser(Long userId);

    // ==================== SEARCH & FILTER ====================

    /**
     * Search users with filters
     * 
     * @param searchRequest search criteria
     * @param pageable      pagination info
     * @return filtered user list
     */
    Page<UserManagementResponse> searchUsers(UserSearchRequest searchRequest, Pageable pageable);

    /**
     * Get users by role
     * 
     * @param role     user role
     * @param pageable pagination info
     * @return users with specified role
     */
    Page<UserManagementResponse> getUsersByRole(String role, Pageable pageable);

    /**
     * Get active users
     * 
     * @param pageable pagination info
     * @return active users
     */
    Page<UserManagementResponse> getActiveUsers(Pageable pageable);

    /**
     * Get locked accounts
     * 
     * @param pageable pagination info
     * @return locked accounts
     */
    Page<UserManagementResponse> getLockedAccounts(Pageable pageable);

    // ==================== ACCOUNT MANAGEMENT ====================

    /**
     * Activate user account
     * 
     * @param userId user ID
     * @return updated user details
     */
    UserManagementResponse activateUser(Long userId);

    /**
     * Deactivate user account
     * 
     * @param userId user ID
     * @return updated user details
     */
    UserManagementResponse deactivateUser(Long userId);

    /**
     * Lock user account
     * 
     * @param userId     user ID
     * @param lockReason lock reason
     * @return updated user details
     */
    UserManagementResponse lockUser(Long userId, String lockReason);

    /**
     * Unlock user account
     * 
     * @param userId user ID
     * @return updated user details
     */
    UserManagementResponse unlockUser(Long userId);

    /**
     * Verify user email
     * 
     * @param userId user ID
     * @return updated user details
     */
    UserManagementResponse verifyUserEmail(Long userId);

    /**
     * Reset user password
     * 
     * @param userId      user ID
     * @param newPassword new password
     * @return updated user details
     */
    UserManagementResponse resetUserPassword(Long userId, String newPassword);

    // ==================== MEMBERSHIP MANAGEMENT ====================

    /**
     * Update user membership points
     * 
     * @param userId user ID
     * @param points points to add/subtract
     * @param reason adjustment reason
     * @return updated user details
     */
    UserManagementResponse updateMembershipPoints(Long userId, Integer points, String reason);

    /**
     * Update user membership level
     * 
     * @param userId user ID
     * @param level  new membership level
     * @return updated user details
     */
    UserManagementResponse updateMembershipLevel(Long userId, String level);

    // ==================== STATISTICS & ANALYTICS ====================

    /**
     * Get user statistics
     * 
     * @return user statistics
     */
    UserStatisticsResponse getUserStatistics();

    /**
     * Export users to CSV
     * 
     * @param searchRequest search criteria (optional)
     * @return CSV byte array
     */
    byte[] exportUsersToCSV(UserSearchRequest searchRequest);

    /**
     * Export users to Excel
     * 
     * @param searchRequest search criteria (optional)
     * @return Excel byte array
     */
    byte[] exportUsersToExcel(UserSearchRequest searchRequest);

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk activate users
     * 
     * @param userIds list of user IDs
     * @return number of users activated
     */
    int bulkActivateUsers(List<Long> userIds);

    /**
     * Bulk deactivate users
     * 
     * @param userIds list of user IDs
     * @return number of users deactivated
     */
    int bulkDeactivateUsers(List<Long> userIds);

    /**
     * Bulk delete users
     * 
     * @param userIds list of user IDs
     * @return number of users deleted
     */
    int bulkDeleteUsers(List<Long> userIds);

    // ==================== VALIDATION ====================

    /**
     * Check if username is available
     * 
     * @param username      username to check
     * @param excludeUserId user ID to exclude from check (for updates)
     * @return true if available
     */
    boolean isUsernameAvailable(String username, Long excludeUserId);

    /**
     * Check if email is available
     * 
     * @param email         email to check
     * @param excludeUserId user ID to exclude from check (for updates)
     * @return true if available
     */
    boolean isEmailAvailable(String email, Long excludeUserId);

    /**
     * Check if employee code is available
     * 
     * @param employeeCode  employee code to check
     * @param excludeUserId user ID to exclude from check (for updates)
     * @return true if available
     */
    boolean isEmployeeCodeAvailable(String employeeCode, Long excludeUserId);
}