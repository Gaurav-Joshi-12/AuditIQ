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
public class AnomalyResponse {
    private Long anomalyId;
    private String transactionId;
    private String vendorName;
    private String vendorId;
    private String department;
    private BigDecimal amount;
    private String ledgerType;
    private String category;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private LocalDateTime transactionDate;
    private String paymentMode;
    private List<String> flags;
    private String severity;
    private Integer severityScore;
    private String explanation;
    private LocalDateTime detectedAt;
}
