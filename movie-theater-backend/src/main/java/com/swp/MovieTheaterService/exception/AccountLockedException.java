package com.swp.MovieTheaterService.exception;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Account Locked Exception
 * Thrown when user account is locked/banned
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AccountLockedException extends RuntimeException {
    
    private final String reason;
    private final LocalDateTime lockedUntil;
    private final boolean isPermanent;
    
    public AccountLockedException(String reason, LocalDateTime lockedUntil) {
        super("Account is locked: " + reason);
        this.reason = reason;
        this.lockedUntil = lockedUntil;
        this.isPermanent = lockedUntil == null;
    }
    
    public AccountLockedException(String reason) {
        super("Account is permanently locked: " + reason);
        this.reason = reason;
        this.lockedUntil = null;
        this.isPermanent = true;
    }
}
