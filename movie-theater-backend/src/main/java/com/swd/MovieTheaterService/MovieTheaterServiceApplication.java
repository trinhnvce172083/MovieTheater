package com.swp.MovieTheaterService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Movie Theater Management System
 * Main Application Class
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class MovieTheaterServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MovieTheaterServiceApplication.class, args);
        System.out.println("🎬 Movie Theater Management System Started Successfully!");
        System.out.println("📍 Server running on: http://localhost:8080/cinema");
        System.out.println("📚 API Documentation: http://localhost:8080/cinema/swagger-ui.html");
        System.out.println("⏰ Scheduled Tasks: Movie Status Auto-Update Enabled");
    }
}
`