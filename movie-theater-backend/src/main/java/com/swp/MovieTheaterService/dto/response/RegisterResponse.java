package com.swp.MovieTheaterService.dto.response;

import com.swp.MovieTheaterService.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Register Response DTO
 * Data Transfer Object for registration response
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponse {

    private Long accountId;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private String membershipLevel;
    private Integer membershipPoints;
    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime registrationDate;
    private String message;

    public static RegisterResponse fromAccount(com.swp.MovieTheaterService.entity.Account account, String message) {
        return RegisterResponse.builder()
                .accountId(account.getAccountId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phoneNumber(account.getPhoneNumber())
                .role(account.getRole())
                .membershipLevel(account.getMembershipLevel())
                .membershipPoints(account.getMembershipPoints())
                .isActive(account.getIsActive())
                .isVerified(account.getIsVerified())
                .registrationDate(account.getCreatedAt())
                .message(message)
                .build();
    }
}