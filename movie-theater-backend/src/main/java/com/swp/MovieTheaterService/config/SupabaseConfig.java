package com.swp.MovieTheaterService.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import okhttp3.OkHttpClient;
import java.time.Duration;

@Configuration
@Getter
@Setter
public class SupabaseConfig {
    
    @Value("${supabase.url}")
    private String url;
    
    @Value("${supabase.key}")
    private String key;
    
    @Value("${supabase.bucket}")
    private String bucket;
    
    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(30))
                .readTimeout(Duration.ofSeconds(30))
                .writeTimeout(Duration.ofSeconds(30))
                .build();
    }
} 
