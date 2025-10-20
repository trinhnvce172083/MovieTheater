package com.swp.MovieTheaterService.entity;

import com.swp.MovieTheaterService.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Account Entity - User Management
 * Represents all users in the system (Admin, Employee, Member, Customer)
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_account")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Account extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "email_verification_expiry")
    private LocalDateTime emailVerificationExpiry;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_expires")
    private LocalDateTime resetPasswordExpires;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // Account lockout fields
    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    @Column(name = "last_failed_login")
    private LocalDateTime lastFailedLogin;

    // OAuth2 fields
    @Column(name = "provider")
    private String provider; // google, facebook, etc.

    @Column(name = "provider_id")
    private String providerId;

    // Member specific fields
    @Column(name = "membership_points")
    @Builder.Default
    private Integer membershipPoints = 0;

    @Column(name = "membership_level", length = 20)
    @Builder.Default
    private String membershipLevel = "BRONZE"; // BRONZE, SILVER, GOLD, PLATINUM

    // Marketing preferences
    @Column(name = "accept_marketing", nullable = false)
    @Builder.Default
    private Boolean acceptMarketing = false;

    // Employee specific fields
    @Column(name = "employee_code", unique = true, length = 20)
    private String employeeCode;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "salary")
    private Double salary;

    @Column(name = "department", length = 50)
    private String department;

    // Relationships
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    // Spring Security UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return isActive;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive && emailVerified;
    }

    // Business methods
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isEmployee() {
        return role == Role.EMPLOYEE;
    }

    public boolean isMember() {
        return role == Role.MEMBER;
    }

    public boolean isCustomer() {
        return role == Role.CUSTOMER;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public LocalDateTime getEmailVerificationExpiry() {
        return emailVerificationExpiry;
    }

    public void setEmailVerificationExpiry(LocalDateTime emailVerificationExpiry) {
        this.emailVerificationExpiry = emailVerificationExpiry;
    }

    public void addMembershipPoints(int points) {
        this.membershipPoints += points;
        updateMembershipLevel();
    }

    private void updateMembershipLevel() {
        if (membershipPoints >= 10000) {
            membershipLevel = "PLATINUM";
        } else if (membershipPoints >= 5000) {
            membershipLevel = "GOLD";
        } else if (membershipPoints >= 2000) {
            membershipLevel = "SILVER";
        } else {
            membershipLevel = "BRONZE";
        }
    }

    // Explicit getter methods for Booking entity compatibility
    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Long getId() {
        return accountId;
    }

    public void setId(Long id) {
        this.accountId = id;
    }

    // Account lockout business methods
    public boolean isAccountLocked() {
        return accountLockedUntil != null && accountLockedUntil.isAfter(LocalDateTime.now());
    }

    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts = (this.failedLoginAttempts == null) ? 1 : this.failedLoginAttempts + 1;
        this.lastFailedLogin = LocalDateTime.now();

        // Lock account after 5 failed attempts for 30 minutes
        if (this.failedLoginAttempts >= 5) {
            this.accountLockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lastFailedLogin = null;
        this.accountLockedUntil = null;
        this.lastLogin = LocalDateTime.now();
    }

    public void unlockAccount() {
        this.failedLoginAttempts = 0;
        this.accountLockedUntil = null;
        this.lastFailedLogin = null;
    }
} 
