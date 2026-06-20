package com.auditiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchedAnomaly {
    private String transactionId;
    private String vendorName;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private List<String> flags;
    private String severity;
    private String explanation;
}
