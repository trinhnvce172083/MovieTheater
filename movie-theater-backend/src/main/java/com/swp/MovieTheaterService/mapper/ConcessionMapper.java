package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.cinema.ConcessionDTO;
import com.swp.MovieTheaterService.entity.Concession;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Concession Mapper
 * Converts between Concession entity and ConcessionDTO
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Component
public class ConcessionMapper {
    
    public ConcessionDTO toDTO(Concession concession) {
        if (concession == null) {
            return null;
        }
        
        return ConcessionDTO.builder()
                .concessionId(concession.getConcessionId())
                .name(concession.getName())
                .description(concession.getDescription())
                .category(concession.getCategory())
                .price(concession.getPrice())
                .imageUrl(concession.getImageUrl())
                .size(concession.getSize())
                .flavor(concession.getFlavor())
                .stockQuantity(concession.getStockQuantity())
                .isAvailable(concession.getIsAvailable())
                .isActive(concession.getIsActive())
                .displayOrder(concession.getDisplayOrder())
                .build();
    }
    
    public List<ConcessionDTO> toDTOList(List<Concession> concessions) {
        if (concessions == null) {
            return List.of();
        }
        
        return concessions.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
