package com.swp.MovieTheaterService.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web MVC Configuration for Spring Boot 3.x
 * Configuration for Spring MVC settings (without @EnableWebMvc to avoid
 * conflict)
 * Fix PageImpl serialization warning với VIA_DTO mode
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.1
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Swagger UI resources
                registry.addResourceHandler("/swagger-ui/**")
                                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/");

                registry.addResourceHandler("/swagger-ui.html")
                                .addResourceLocations("classpath:/META-INF/resources/");

                // OpenAPI spec
                registry.addResourceHandler("/v3/api-docs/**")
                                .addResourceLocations("classpath:/META-INF/resources/");

                // Static resources
                registry.addResourceHandler("/static/**")
                                .addResourceLocations("classpath:/static/");
        }

        @Override
        public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                                .allowedOriginPatterns(
                                        "http://localhost:3000", // NextJS development
                                        "http://localhost:3001", // Alternative port
                                        "http://localhost:8080", // Backend for testing
                                        "https://*.vercel.app"   // Vercel deployments
                                )
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*")
                                .allowCredentials(true)
                                .maxAge(3600);
        }

        // Custom ObjectMapper removed to avoid conflict with Spring Boot
        // auto-configuration
        // Jackson settings are now handled via application.yml

        @Override
        public void addViewControllers(ViewControllerRegistry registry) {
                // Chuyển hướng đến swagger UI
                registry.addRedirectViewController("/api-docs", "/swagger-ui/index.html");
                registry.addRedirectViewController("/swagger-ui", "/swagger-ui/index.html");
                registry.addRedirectViewController("/docs", "/swagger-ui/index.html");
        }
}