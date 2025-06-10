package com.swp.MovieTheaterService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class JsonDeserializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testRegisterRequestDeserialization() throws Exception {
        String json = """
                {
                    "username": "testuser123",
                    "fullName": "Test User Full Name",
                    "email": "test@example.com",
                    "password": "12345Aa!",
                    "confirmPassword": "12345Aa!",
                    "phoneNumber": "0399927256",
                    "dateOfBirth": "2000-01-01",
                    "address": "Test Address",
                    "agreeToTerms": true,
                    "acceptMarketing": false
                }
                """;

        System.out.println("=== JSON DESERIALIZATION TEST ===");
        System.out.println("Input JSON: " + json);

        // Test deserialization
        RegisterRequest request = objectMapper.readValue(json, RegisterRequest.class);

        System.out.println("Deserialized object: " + request);
        System.out.println("Username: [" + request.getUsername() + "] (null: " + (request.getUsername() == null) + ")");
        System.out.println("Email: [" + request.getEmail() + "] (null: " + (request.getEmail() == null) + ")");
        System.out.println("Password: [PROTECTED] (null: " + (request.getPassword() == null) + ")");
        System.out.println("FullName: [" + request.getFullName() + "] (null: " + (request.getFullName() == null) + ")");
        System.out.println("==================================");

        // Assertions
        assertNotNull(request, "RegisterRequest should not be null");
        assertNotNull(request.getUsername(), "Username should not be null");
        assertNotNull(request.getEmail(), "Email should not be null");
        assertNotNull(request.getPassword(), "Password should not be null");
        assertNotNull(request.getFullName(), "FullName should not be null");

        assertEquals("testuser123", request.getUsername());
        assertEquals("test@example.com", request.getEmail());
        assertEquals("12345Aa!", request.getPassword());
        assertEquals("Test User Full Name", request.getFullName());
        assertEquals("0399927256", request.getPhoneNumber());
        assertTrue(request.getAgreeToTerms());
        assertFalse(request.getAcceptMarketing());
    }
} 