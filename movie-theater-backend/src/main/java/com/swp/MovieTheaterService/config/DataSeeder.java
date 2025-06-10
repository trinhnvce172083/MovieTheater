package com.swp.MovieTheaterService.config;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;
import com.swp.MovieTheaterService.repository.ConcessionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ConcessionRepository concessionRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeConcessions();
    }

    private void initializeConcessions() {
        if (concessionRepository.count() == 0) {
            log.info("Initializing concession data");
            
            // Bắp rang 4 vị - size M
            List<Concession> concessions = Arrays.asList(
                Concession.builder()
                    .name("Bắp rang")
                    .description("Bắp rang thơm ngon, giòn tan")
                    .category(ConcessionCategory.POPCORN)
                    .flavor("traditional")
                    .size("M")
                    .price(new BigDecimal("35000"))
                    .stockQuantity(100)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(1)
                    .imageUrl("/images/concessions/popcorn-traditional.jpg")
                    .build(),
                    
                Concession.builder()
                    .name("Bắp rang")
                    .description("Bắp rang vị bơ thơm béo")
                    .category(ConcessionCategory.POPCORN)
                    .flavor("butter")
                    .size("M")
                    .price(new BigDecimal("40000"))
                    .stockQuantity(100)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(2)
                    .imageUrl("/images/concessions/popcorn-butter.jpg")
                    .build(),
                    
                Concession.builder()
                    .name("Bắp rang")
                    .description("Bắp rang vị caramel ngọt ngào")
                    .category(ConcessionCategory.POPCORN)
                    .flavor("caramel")
                    .size("M")
                    .price(new BigDecimal("45000"))
                    .stockQuantity(100)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(3)
                    .imageUrl("/images/concessions/popcorn-caramel.jpg")
                    .build(),
                    
                Concession.builder()
                    .name("Bắp rang")
                    .description("Bắp rang vị phô mai thơm nồng")
                    .category(ConcessionCategory.POPCORN)
                    .flavor("cheese")
                    .size("M")
                    .price(new BigDecimal("45000"))
                    .stockQuantity(100)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(4)
                    .imageUrl("/images/concessions/popcorn-cheese.jpg")
                    .build(),
                    
                // Nước uống
                Concession.builder()
                    .name("Coca Cola")
                    .description("Nước ngọt Coca Cola mát lạnh")
                    .category(ConcessionCategory.DRINKS)
                    .size("M")
                    .price(new BigDecimal("25000"))
                    .stockQuantity(200)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(5)
                    .imageUrl("/images/concessions/coca-cola.jpg")
                    .build(),
                    
                Concession.builder()
                    .name("Pepsi")
                    .description("Nước ngọt Pepsi mát lạnh")
                    .category(ConcessionCategory.DRINKS)
                    .size("M")
                    .price(new BigDecimal("25000"))
                    .stockQuantity(200)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(6)
                    .imageUrl("/images/concessions/pepsi.jpg")
                    .build(),
                    
                Concession.builder()
                    .name("7Up")
                    .description("Nước ngọt 7Up chanh tươi")
                    .category(ConcessionCategory.DRINKS)
                    .size("M")
                    .price(new BigDecimal("25000"))
                    .stockQuantity(200)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(7)
                    .imageUrl("/images/concessions/7up.jpg")
                    .build(),
                    
                Concession.builder()
                    .name("Nước suối")
                    .description("Nước suối tinh khiết")
                    .category(ConcessionCategory.DRINKS)
                    .size("M")
                    .price(new BigDecimal("15000"))
                    .stockQuantity(300)
                    .isAvailable(true)
                    .isActive(true)
                    .displayOrder(8)
                    .imageUrl("/images/concessions/water.jpg")
                    .build()
            );
            
            concessionRepository.saveAll(concessions);
            log.info("Created {} concession items", concessions.size());
        }
    }
} 