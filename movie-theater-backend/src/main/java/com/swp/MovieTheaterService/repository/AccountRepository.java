package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Account Repository
 * Data access layer for Account entity
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // Find by unique fields
    Optional<Account> findByUsername(String username);
    
    Optional<Account> findByEmail(String email);
    
    Optional<Account> findByEmployeeCode(String employeeCode);

    // Check existence
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByEmployeeCode(String employeeCode);
    
    boolean existsByPhoneNumber(String phoneNumber);

    // Find by verification token
    Optional<Account> findByVerificationToken(String verificationToken);
    
    Optional<Account> findByEmailVerificationToken(String emailVerificationToken);
    
    Optional<Account> findByResetPasswordToken(String resetPasswordToken);

    // Find by OAuth2 provider
    Optional<Account> findByProviderAndProviderId(String provider, String providerId);

    // Find by role
    List<Account> findByRole(Role role);
    
    List<Account> findByRoleAndIsActive(Role role, Boolean isActive);

    // Find active accounts
    List<Account> findByIsActive(Boolean isActive);
    
    List<Account> findByIsVerified(Boolean isVerified);

    // Custom queries
    @Query("SELECT a FROM Account a WHERE a.email = :email AND a.isActive = true")
    Optional<Account> findActiveAccountByEmail(@Param("email") String email);

    @Query("SELECT a FROM Account a WHERE a.username = :username AND a.isActive = true")
    Optional<Account> findActiveAccountByUsername(@Param("username") String username);

    @Query("SELECT a FROM Account a WHERE (a.email = :emailOrUsername OR a.username = :emailOrUsername) AND a.isActive = true")
    Optional<Account> findActiveAccountByEmailOrUsername(@Param("emailOrUsername") String emailOrUsername);

    @Query("SELECT COUNT(a) FROM Account a WHERE a.role = :role")
    long countByRole(@Param("role") Role role);

    @Query("SELECT a FROM Account a WHERE a.membershipLevel = :level AND a.role IN ('MEMBER', 'CUSTOMER')")
    List<Account> findByMembershipLevel(@Param("level") String level);
} 