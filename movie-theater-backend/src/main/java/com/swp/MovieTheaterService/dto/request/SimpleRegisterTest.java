package com.swp.MovieTheaterService.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Simple Register Test - Minimal class for JSON deserialization testing
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleRegisterTest {

    private String username;
    private String email;
    private String password;
    private String fullName;
    private Boolean agreeToTerms;

    // Default constructor
    public SimpleRegisterTest() {
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Boolean getAgreeToTerms() {
        return agreeToTerms;
    }

    public void setAgreeToTerms(Boolean agreeToTerms) {
        this.agreeToTerms = agreeToTerms;
    }

    @Override
    public String toString() {
        return "SimpleRegisterTest{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='" + (password != null ? "[PROTECTED]" : "null") + '\'' +
                ", fullName='" + fullName + '\'' +
                ", agreeToTerms=" + agreeToTerms +
                '}';
    }
}