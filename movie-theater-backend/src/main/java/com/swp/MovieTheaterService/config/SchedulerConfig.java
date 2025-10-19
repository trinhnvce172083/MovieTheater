package com.swp.MovieTheaterService.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

import java.util.concurrent.Executors;

/**
 * Scheduler Configuration
 * Cấu hình cho các tác vụ định thời (scheduled tasks)
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Configuration
@EnableScheduling
public class SchedulerConfig implements SchedulingConfigurer {

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        // Sử dụng thread pool với 3 threads cho các scheduled tasks
        // Để tránh blocking khi có nhiều tasks chạy đồng thời
        taskRegistrar.setScheduler(Executors.newScheduledThreadPool(3, r -> {
            Thread thread = new Thread(r, "auto-schedule-task");
            thread.setDaemon(true); // Daemon thread sẽ không ngăn JVM shutdown
            return thread;
        }));
    }
}
