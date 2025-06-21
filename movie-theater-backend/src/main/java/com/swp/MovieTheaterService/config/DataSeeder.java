package com.swp.MovieTheaterService.config;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.enums.ConcessionCategory;
import com.swp.MovieTheaterService.enums.PromotionType;
import com.swp.MovieTheaterService.repository.ConcessionRepository;
import com.swp.MovieTheaterService.repository.PromotionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ConcessionRepository concessionRepository;
    
    @Autowired
    private PromotionRepository promotionRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeConcessions();
        initializePromotions();
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

    private void initializePromotions() {
        if (promotionRepository.count() == 0) {
            log.info("Initializing promotion data");
            
            try {
                List<Promotion> promotions = Arrays.asList(
                    // 1. Promotion công khai - Giảm giá cuối tuần
                    Promotion.builder()
                        .promotionCode("WEEKEND50")
                        .promotionName("Khuyến mãi cuối tuần")
                        .description("Giảm 50,000 VND cho booking vào cuối tuần (Thứ 7, Chủ nhật)")
                        .promotionType(PromotionType.PUBLIC)
                        .discountType("FIXED_AMOUNT")
                        .discountValue(50000.0)
                        .minPurchaseAmount(150000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(3))
                        .isActive(true)
                        .maxUsageCount(1000)
                        .currentUsageCount(0)
                        .maxUsagePerUser(5)
                        .applicableDays("WEEKENDS")
                        .memberOnly(false)
                        .bannerUrl("/images/promotions/weekend-banner.jpg")
                        .isFeatured(true)
                        .displayOrder(1)
                        .build(),

                    // 2. Promotion thành viên - Giảm phần trăm
                    Promotion.builder()
                        .promotionCode("MEMBER25")
                        .promotionName("Ưu đãi thành viên")
                        .description("Giảm 25% cho thành viên GOLD và PLATINUM (tối đa 100k)")
                        .promotionType(PromotionType.PUBLIC)
                        .discountType("PERCENTAGE")
                        .discountValue(25.0)
                        .maxDiscountAmount(100000.0)
                        .minPurchaseAmount(200000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(6))
                        .isActive(true)
                        .maxUsageCount(500)
                        .currentUsageCount(0)
                        .maxUsagePerUser(3)
                        .memberOnly(true)
                        .membershipLevels("GOLD,PLATINUM")
                        .bannerUrl("/images/promotions/member-banner.jpg")
                        .isFeatured(true)
                        .displayOrder(2)
                        .build(),

                    // 3. Promotion đổi điểm - Giảm cố định
                    Promotion.builder()
                        .promotionCode("POINTS100")
                        .promotionName("Đổi điểm giảm giá")
                        .description("Dùng 200 điểm để nhận mã giảm 100,000 VND")
                        .promotionType(PromotionType.POINT_BASED)
                        .discountType("FIXED_AMOUNT")
                        .discountValue(100000.0)
                        .minPurchaseAmount(250000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(12))
                        .isActive(true)
                        .currentUsageCount(0)
                        .memberOnly(true)
                        .pointsRequired(200)
                        .pointsValue(100000)
                        .codeValidityHours(72)
                        .maxCodesPerUser(2)
                        .bannerUrl("/images/promotions/points-banner.jpg")
                        .isFeatured(false)
                        .displayOrder(3)
                        .build(),

                    // 4. Promotion sinh nhật
                    Promotion.builder()
                        .promotionCode("BIRTHDAY30")
                        .promotionName("Ưu đãi sinh nhật")
                        .description("Giảm 30% trong tháng sinh nhật (tối đa 150k)")
                        .promotionType(PromotionType.PUBLIC)
                        .discountType("PERCENTAGE")
                        .discountValue(30.0)
                        .maxDiscountAmount(150000.0)
                        .minPurchaseAmount(100000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusYears(1))
                        .isActive(true)
                        .currentUsageCount(0)
                        .maxUsagePerUser(1)
                        .memberOnly(true)
                        .bannerUrl("/images/promotions/birthday-banner.jpg")
                        .isFeatured(false)
                        .displayOrder(4)
                        .build(),

                    // 5. Promotion học sinh sinh viên
                    Promotion.builder()
                        .promotionCode("STUDENT20")
                        .promotionName("Ưu đãi học sinh sinh viên")
                        .description("Giảm 20% cho học sinh sinh viên vào các ngày trong tuần")
                        .promotionType(PromotionType.PUBLIC)
                        .discountType("PERCENTAGE")
                        .discountValue(20.0)
                        .maxDiscountAmount(80000.0)
                        .minPurchaseAmount(120000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(6))
                        .isActive(true)
                        .maxUsageCount(2000)
                        .currentUsageCount(0)
                        .maxUsagePerUser(10)
                        .applicableDays("WEEKDAYS")
                        .applicableTimes("MORNING,AFTERNOON")
                        .memberOnly(false)
                        .bannerUrl("/images/promotions/student-banner.jpg")
                        .isFeatured(true)
                        .displayOrder(5)
                        .build(),

                    // 6. Promotion phim mới
                    Promotion.builder()
                        .promotionCode("NEWMOVIE15")
                        .promotionName("Phim mới ra mắt")
                        .description("Giảm 15% cho các phim mới ra mắt")
                        .promotionType(PromotionType.PUBLIC)
                        .discountType("PERCENTAGE")
                        .discountValue(15.0)
                        .maxDiscountAmount(60000.0)
                        .minPurchaseAmount(150000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(2))
                        .isActive(true)
                        .maxUsageCount(800)
                        .currentUsageCount(0)
                        .maxUsagePerUser(3)
                        .memberOnly(false)
                        .bannerUrl("/images/promotions/newmovie-banner.jpg")
                        .isFeatured(false)
                        .displayOrder(6)
                        .build(),

                    // 7. Promotion VIP - Đổi điểm cao cấp
                    Promotion.builder()
                        .promotionCode("VIP200")
                        .promotionName("VIP Giảm giá đặc biệt")
                        .description("Dùng 500 điểm để nhận mã giảm 200,000 VND cho thành viên PLATINUM")
                        .promotionType(PromotionType.POINT_BASED)
                        .discountType("FIXED_AMOUNT")
                        .discountValue(200000.0)
                        .minPurchaseAmount(400000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(12))
                        .isActive(true)
                        .currentUsageCount(0)
                        .memberOnly(true)
                        .membershipLevels("PLATINUM")
                        .pointsRequired(500)
                        .pointsValue(200000)
                        .codeValidityHours(48)
                        .maxCodesPerUser(1)
                        .bannerUrl("/images/promotions/vip-banner.jpg")
                        .isFeatured(true)
                        .displayOrder(7)
                        .build(),

                    // 8. Promotion combo - Buy one get one
                    Promotion.builder()
                        .promotionCode("COMBO2FOR1")
                        .promotionName("Mua 1 tặng 1 combo")
                        .description("Mua combo bắp nước, tặng thêm 1 combo (áp dụng buổi sáng)")
                        .promotionType(PromotionType.PUBLIC)
                        .discountType("BUY_ONE_GET_ONE")
                        .discountValue(60000.0) // Giá trị combo được tặng
                        .minPurchaseAmount(120000.0)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(1))
                        .isActive(true)
                        .maxUsageCount(300)
                        .currentUsageCount(0)
                        .maxUsagePerUser(2)
                        .applicableTimes("MORNING")
                        .memberOnly(false)
                        .bannerUrl("/images/promotions/combo-banner.jpg")
                        .isFeatured(false)
                        .displayOrder(8)
                        .build()
                );
                
                promotionRepository.saveAll(promotions);
                log.info("Created {} promotion items", promotions.size());
                
            } catch (Exception e) {
                log.error("Error initializing promotions: {}", e.getMessage(), e);
            }
        } else {
            log.info("Promotions already exist, skipping initialization");
        }
    }
} 