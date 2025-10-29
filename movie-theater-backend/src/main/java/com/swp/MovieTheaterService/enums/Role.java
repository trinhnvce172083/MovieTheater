package com.swp.MovieTheaterService.enums;

/**
 * Role Enum - User Roles
 * Defines different user roles in the system
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public enum Role {
    ADMIN("Admin"),
    EMPLOYEE("Employee"), 
    MEMBER("Member"),
    CUSTOMER("Customer");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isAdmin() {
        return this == ADMIN;
    }

    public boolean isEmployee() {
        return this == EMPLOYEE;
    }

    public boolean isMember() {
        return this == MEMBER;
    }

    public boolean isCustomer() {
        return this == CUSTOMER;
    }
}