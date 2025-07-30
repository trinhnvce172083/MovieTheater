package com.swp.MovieTheaterService.exception;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Multiple Parameter Validation Exception
 * Xử lý lỗi validation cho nhiều tham số cùng lúc
 *
 * @author Dũng_Solo
 * @version 1.0.0
 */
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MultipleParameterValidationException extends RuntimeException {

    List<String> missingParameters;

    public MultipleParameterValidationException(List<String> missingParameters) {
        super("Missing required parameters: " + String.join(", ", missingParameters));
        this.missingParameters = missingParameters;
    }

    public List<String> getMissingParameters() {
        return missingParameters;
    }
} 