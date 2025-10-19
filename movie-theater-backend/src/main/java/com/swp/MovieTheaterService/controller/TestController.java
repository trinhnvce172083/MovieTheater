package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import com.swp.MovieTheaterService.dto.request.SimpleRegisterTest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import com.swp.MovieTheaterService.service.RateLimitService;
import com.swp.MovieTheaterService.utils.IpUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

import com.swp.MovieTheaterService.service.PromotionService;
import com.swp.MovieTheaterService.entity.Promotion;

/**
 * Test Controller
 * Simple controller for testing API without authentication
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/test")
@Tag(name = "Test", description = "Test APIs for authentication")
public class TestController {

    @Autowired
    private RateLimitService rateLimitService;

    @Autowired
    private PromotionService promotionService;

    @GetMapping("/public")
    @Operation(summary = "Public endpoint", description = "Test public endpoint")
    public ResponseEntity<ApiResponse<String>> publicEndpoint() {
        log.debug("Public endpoint accessed");
        return ResponseEntity.ok(ApiResponse.success("Public endpoint accessed successfully"));
    }

    @GetMapping("/protected")
    @Operation(summary = "Protected endpoint", description = "Test protected endpoint")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> protectedEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        log.debug("Protected endpoint accessed by: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Protected endpoint works! User: " + username));
    }

    @GetMapping("/admin")
    @Operation(summary = "Admin endpoint", description = "Test admin endpoint")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> adminEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        log.debug("Admin endpoint accessed by: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Admin endpoint works! User: " + username));
    }

    @GetMapping("/customer")
    @Operation(summary = "Customer endpoint", description = "Test customer endpoint")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> customerEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        log.debug("Customer endpoint accessed by: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Customer endpoint works! User: " + username));
    }

    @PostMapping("/register")
    @Operation(summary = "Test register request", description = "Test RegisterRequest deserialization")
    public ResponseEntity<ApiResponse<String>> testRegister(@RequestBody RegisterRequest request) {
        log.info("=== REGISTER TEST ===");
        log.info("Received RegisterRequest: {}", request);
        log.info("Username: {}", request.getUsername());
        log.info("FullName: {}", request.getFullName());
        log.info("Email: {}", request.getEmail());
        log.info("PhoneNumber: {}", request.getPhoneNumber());
        log.info("DateOfBirth: {}", request.getDateOfBirth());
        log.info("Address: {}", request.getAddress());
        log.info("AgreeToTerms: {}", request.getAgreeToTerms());
        log.info("AcceptMarketing: {}", request.getAcceptMarketing());
        log.info("====================");

        return ResponseEntity
                .ok(ApiResponse.success("RegisterRequest deserialization test successful", request.toString()));
    }

    @PostMapping("/register-with-validation")
    @Operation(summary = "Test register request WITH @Valid", description = "Test RegisterRequest deserialization WITH validation")
    public ResponseEntity<ApiResponse<String>> testRegisterWithValidation(@Valid @RequestBody RegisterRequest request) {
        log.info("=== REGISTER WITH VALIDATION TEST ===");
        log.info("Received RegisterRequest: {}", request);
        log.info("Username: {}", request.getUsername());
        log.info("FullName: {}", request.getFullName());
        log.info("Email: {}", request.getEmail());
        log.info("PhoneNumber: {}", request.getPhoneNumber());
        log.info("DateOfBirth: {}", request.getDateOfBirth());
        log.info("Address: {}", request.getAddress());
        log.info("AgreeToTerms: {}", request.getAgreeToTerms());
        log.info("AcceptMarketing: {}", request.getAcceptMarketing());
        log.info("=====================================");

        return ResponseEntity
                .ok(ApiResponse.success("RegisterRequest WITH validation test successful", request.toString()));
    }

    @PostMapping("/json-test")
    @Operation(summary = "Pure JSON test", description = "Test pure JSON without any validation")
    public ResponseEntity<String> testPureJson(@RequestBody String rawJson) {
        log.info("=== PURE JSON TEST ===");
        log.info("Raw JSON received: {}", rawJson);
        log.info("======================");
        return ResponseEntity.ok("Raw JSON length: " + rawJson.length());
    }

    @PostMapping("/minimal-object")
    @Operation(summary = "Minimal object test", description = "Test minimal POJO without Lombok/Validation")
    public ResponseEntity<String> testMinimalObject(@RequestBody TestMinimalRequest request) {
        log.info("=== MINIMAL OBJECT TEST ===");
        log.info("Received: {}", request);
        log.info("username: {}", request.username);
        log.info("email: {}", request.email);
        log.info("===========================");
        return ResponseEntity.ok("Minimal object: " + request.toString());
    }

    @PostMapping("/debug-raw-request")
    @Operation(summary = "Debug raw request", description = "Debug raw HTTP request to see what client sends")
    public ResponseEntity<String> debugRawRequest(HttpServletRequest request) throws IOException {
        log.info("=== DEBUG RAW REQUEST ===");
        log.info("Method: {}", request.getMethod());
        log.info("Content-Type: {}", request.getContentType());
        log.info("Content-Length: {}", request.getContentLength());
        log.info("Character Encoding: {}", request.getCharacterEncoding());

        // Headers
        log.info("Headers:");
        request.getHeaderNames().asIterator().forEachRemaining(headerName -> {
            log.info("  {}: {}", headerName, request.getHeader(headerName));
        });

        log.info("==========================");

        return ResponseEntity.ok("Raw request headers debugged. Content-Length: " + request.getContentLength());
    }

    @PostMapping("/debug-register-object")
    @Operation(summary = "Debug register object", description = "Debug RegisterRequest object after Jackson parsing")
    public ResponseEntity<String> debugRegisterObject(@RequestBody RegisterRequest request) {

        log.info("=== DEBUG REGISTER OBJECT ===");
        log.info("Object received: {}", request);
        log.info("Object class: {}", request.getClass().getName());
        log.info("Fields:");
        log.info("  Username: [{}] (null: {})", request.getUsername(), request.getUsername() == null);
        log.info("  Email: [{}] (null: {})", request.getEmail(), request.getEmail() == null);
        log.info("  FullName: [{}] (null: {})", request.getFullName(), request.getFullName() == null);
        log.info("  PhoneNumber: [{}] (null: {})", request.getPhoneNumber(), request.getPhoneNumber() == null);
        log.info("  DateOfBirth: [{}] (null: {})", request.getDateOfBirth(), request.getDateOfBirth() == null);
        log.info("  Address: [{}] (null: {})", request.getAddress(), request.getAddress() == null);
        log.info("  AgreeToTerms: [{}] (null: {})", request.getAgreeToTerms(), request.getAgreeToTerms() == null);
        log.info("  AcceptMarketing: [{}] (null: {})", request.getAcceptMarketing(),
                request.getAcceptMarketing() == null);
        log.info("==============================");

        // Count null fields
        int nullCount = 0;
        if (request.getUsername() == null)
            nullCount++;
        if (request.getEmail() == null)
            nullCount++;
        if (request.getFullName() == null)
            nullCount++;
        if (request.getPhoneNumber() == null)
            nullCount++;
        if (request.getDateOfBirth() == null)
            nullCount++;
        if (request.getAddress() == null)
            nullCount++;
        if (request.getAgreeToTerms() == null)
            nullCount++;
        if (request.getAcceptMarketing() == null)
            nullCount++;

        return ResponseEntity.ok("Object parsed! Null fields count: " + nullCount + "/8. Check logs for details.");
    }

    @PostMapping("/debug-register-step-by-step")
    @Operation(summary = "Debug register step by step", description = "Debug each step of register process")
    public ResponseEntity<String> debugRegisterStepByStep(
            HttpServletRequest httpRequest,
            @RequestBody String rawJson) {

        log.info("=== STEP BY STEP DEBUG ===");
        log.info("1. HTTP Request Info:");
        log.info("   Method: {}", httpRequest.getMethod());
        log.info("   Content-Type: {}", httpRequest.getContentType());
        log.info("   Content-Length: {}", httpRequest.getContentLength());

        log.info("2. Raw JSON String:");
        log.info("   Raw JSON: '{}'", rawJson);
        log.info("   JSON length: {}", rawJson != null ? rawJson.length() : 0);
        log.info("   JSON isEmpty: {}", rawJson == null || rawJson.trim().isEmpty());

        log.info("===========================");

        return ResponseEntity.ok("Debug completed. JSON length: " + (rawJson != null ? rawJson.length() : 0));
    }

    @PostMapping("/register-like-auth")
    @Operation(summary = "Test register like AuthController", description = "Test RegisterRequest exactly like AuthController does")
    public ResponseEntity<ApiResponse<String>> testRegisterLikeAuth(
            @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = IpUtils.getClientIpAddress(httpRequest);

        // IDENTICAL DEBUG LOGGING AS AUTHCONTROLLER
        log.info("=== TEST REGISTER LIKE AUTH DEBUG ===");
        log.info("Content-Type: {}", httpRequest.getContentType());
        log.info("Content-Length: {}", httpRequest.getContentLength());
        log.info("Method: {}", httpRequest.getMethod());
        log.info("Request object: {}", request);
        log.info("Request object class: {}", request != null ? request.getClass().getName() : "NULL");
        log.info("Username: [{}]", request.getUsername());
        log.info("Email: [{}]", request.getEmail());
        log.info("FullName: [{}]", request.getFullName());
        log.info("PhoneNumber: [{}]", request.getPhoneNumber());
        log.info("AgreeToTerms: [{}]", request.getAgreeToTerms());
        log.info("Password null?: {}", request.getPassword() == null);
        log.info("ConfirmPassword null?: {}", request.getConfirmPassword() == null);
        log.info("DateOfBirth: [{}]", request.getDateOfBirth());
        log.info("Address: [{}]", request.getAddress());
        log.info("AcceptMarketing: [{}]", request.getAcceptMarketing());
        log.info("Client IP: {}", clientIp);

        // Count null fields
        int nullFieldCount = 0;
        if (request.getUsername() == null)
            nullFieldCount++;
        if (request.getEmail() == null)
            nullFieldCount++;
        if (request.getFullName() == null)
            nullFieldCount++;
        if (request.getPhoneNumber() == null)
            nullFieldCount++;
        if (request.getDateOfBirth() == null)
            nullFieldCount++;
        if (request.getAddress() == null)
            nullFieldCount++;
        if (request.getAgreeToTerms() == null)
            nullFieldCount++;
        if (request.getAcceptMarketing() == null)
            nullFieldCount++;

        log.info("NULL FIELDS COUNT: {}/8", nullFieldCount);
        log.info("======================================");

        if (nullFieldCount > 0) {
            return ResponseEntity
                    .ok(ApiResponse.success("FAILED: " + nullFieldCount + " null fields detected", request.toString()));
        } else {
            return ResponseEntity
                    .ok(ApiResponse.success("SUCCESS: All fields populated correctly", request.toString()));
        }
    }

    @PostMapping("/simple-register-test")
    @Operation(summary = "Test simple register", description = "Test SimpleRegisterTest class without validation")
    public ResponseEntity<ApiResponse<String>> testSimpleRegister(@RequestBody SimpleRegisterTest request) {
        log.info("=== SIMPLE REGISTER TEST ===");
        log.info("Received object: {}", request);
        log.info("Username: [{}] (null: {})", request.getUsername(), request.getUsername() == null);
        log.info("Email: [{}] (null: {})", request.getEmail(), request.getEmail() == null);
        log.info("Password: [{}] (null: {})", request.getPassword() != null ? "[PROTECTED]" : "null",
                request.getPassword() == null);
        log.info("FullName: [{}] (null: {})", request.getFullName(), request.getFullName() == null);
        log.info("AgreeToTerms: [{}] (null: {})", request.getAgreeToTerms(), request.getAgreeToTerms() == null);
        log.info("=============================");

        if (request.getPassword() == null) {
            return ResponseEntity.ok(ApiResponse.success("FAILED: Password is null!", request.toString()));
        } else {
            return ResponseEntity
                    .ok(ApiResponse.success("SUCCESS: All critical fields populated!", request.toString()));
        }
    }

    @GetMapping("/test-promotion-system")
    @Operation(summary = "Test promotion system", description = "Test all promotion related functionality")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> testPromotionSystem() {
        Map<String, Object> result = new HashMap<>();

        try {
            // Test 1: Get points-based promotions
            List<Promotion> pointsPromotions = promotionService.getPointsPromotions();
            result.put("pointsPromotions", pointsPromotions.size());
            result.put("pointsPromotionsList", pointsPromotions.stream()
                    .map(p -> Map.of(
                            "id", p.getPromotionId(),
                            "code", p.getPromotionCode(),
                            "name", p.getPromotionName(),
                            "pointsRequired", p.getPointsRequired(),
                            "discountType", p.getDiscountType(),
                            "discountValue", p.getDiscountValue()
                    ))
                    .collect(Collectors.toList()));

            // Test 2: Get redeemable promotions (assuming 1000 points)
            List<Promotion> redeemablePromotions = promotionService.getRedeemablePromotions(1000);
            result.put("redeemablePromotions", redeemablePromotions.size());
            result.put("redeemablePromotionsList", redeemablePromotions.stream()
                    .map(p -> Map.of(
                            "id", p.getPromotionId(),
                            "code", p.getPromotionCode(),
                            "name", p.getPromotionName(),
                            "pointsRequired", p.getPointsRequired()
                    ))
                    .collect(Collectors.toList()));

            // Test 3: Validate a promotion (assuming we have one)
            if (!pointsPromotions.isEmpty()) {
                Promotion testPromotion = pointsPromotions.get(0);
                boolean isValid = promotionService.validatePromotionForBooking(
                        testPromotion.getPromotionCode(), 100000.0);
                result.put("promotionValidation", Map.of(
                        "code", testPromotion.getPromotionCode(),
                        "isValid", isValid
                ));
            }

            result.put("success", true);
            result.put("message", "Promotion system test completed successfully");

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("message", "Promotion system test failed");
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/test-booking-promotion")
    @Operation(summary = "Test booking with promotion", description = "Test booking system with promotion integration")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> testBookingPromotion() {
        Map<String, Object> result = new HashMap<>();

        try {
            // Test 1: Check if we have any promotions
            List<Promotion> allPromotions = promotionService.getActivePromotions();
            result.put("totalPromotions", allPromotions.size());

            // Test 2: Check if we have any bookings
            // This would require access to booking service
            result.put("bookingPromotionIntegration", "Available endpoints:");
            result.put("endpoints", List.of(
                    "POST /api/bookings/{bookingId}/promotion?promotionCode=CODE",
                    "DELETE /api/bookings/{bookingId}/promotion",
                    "GET /api/bookings/{bookingId}/promotion"
            ));

            // Test 3: Sample promotion data structure
            if (!allPromotions.isEmpty()) {
                Promotion sample = allPromotions.get(0);
                result.put("samplePromotion", Map.of(
                        "id", sample.getPromotionId(),
                        "code", sample.getPromotionCode(),
                        "name", sample.getPromotionName(),
                        "discountType", sample.getDiscountType(),
                        "discountValue", sample.getDiscountValue(),
                        "pointsRequired", sample.getPointsRequired(),
                        "canBeRedeemedWithPoints", sample.canBeRedeemedWithPoints(),
                        "isActive", sample.getIsActive(),
                        "hasBanner", sample.getBannerImageUrl() != null
                ));
            }

            result.put("success", true);
            result.put("message", "Booking promotion integration test completed");

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("message", "Booking promotion test failed");
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/debug-token")
    @Operation(summary = "Debug token info", description = "Debug JWT token information")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> debugToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> debugInfo = new HashMap<>();

        debugInfo.put("username", auth.getName());
        debugInfo.put("authorities", auth.getAuthorities().stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toList()));
        debugInfo.put("isAuthenticated", auth.isAuthenticated());
        debugInfo.put("principal", auth.getPrincipal().getClass().getSimpleName());

        // Get user details if available
        if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            org.springframework.security.core.userdetails.UserDetails userDetails =
                    (org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal();
            debugInfo.put("userDetails", Map.of(
                    "username", userDetails.getUsername(),
                    "authorities", userDetails.getAuthorities().stream()
                            .map(Object::toString)
                            .collect(java.util.stream.Collectors.toList()),
                    "enabled", userDetails.isEnabled(),
                    "accountNonExpired", userDetails.isAccountNonExpired(),
                    "accountNonLocked", userDetails.isAccountNonLocked(),
                    "credentialsNonExpired", userDetails.isCredentialsNonExpired()
            ));
        }

        return ResponseEntity.ok(debugInfo);
    }

    @GetMapping("/debug-role")
    @Operation(summary = "Debug role access", description = "Test different role access patterns")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> debugRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> roleInfo = new HashMap<>();

        roleInfo.put("username", auth.getName());
        roleInfo.put("hasRoleAdmin", auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        roleInfo.put("hasRoleMember", auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MEMBER")));
        roleInfo.put("hasRoleEmployee", auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE")));
        roleInfo.put("hasRoleCustomer", auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
        roleInfo.put("allAuthorities", auth.getAuthorities().stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toList()));

        return ResponseEntity.ok(roleInfo);
    }

    // Simple POJO class for testing
    public static class TestMinimalRequest {
        public String username;
        public String email;
        public String fullName;

        @Override
        public String toString() {
            return "TestMinimalRequest{username='" + username + "', email='" + email + "', fullName='" + fullName
                    + "'}";
        }
    }
}
