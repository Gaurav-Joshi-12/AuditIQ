package com.auditiq.service.pipeline;

import com.auditiq.model.AnomalyResult;
import com.auditiq.model.ApprovedVendor;
import com.auditiq.model.Transaction;
import com.auditiq.repository.ApprovedVendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnomalyDetectionAgent {

    private final ApprovedVendorRepository approvedVendorRepository;

    public List<AnomalyResult> detect(List<Transaction> transactions, Long companyId) {
        List<AnomalyResult> results = new ArrayList<>();
        
        Set<String> approvedVendorNames = approvedVendorRepository.findByCompanyId(companyId)
                .stream()
                .map(ApprovedVendor::getVendorName)
                .collect(Collectors.toSet());

        for (int i = 0; i < transactions.size(); i++) {
            Transaction tx = transactions.get(i);
            List<String> flags = new ArrayList<>();
            int severityScore = 0;

            // 1. ROUND_NUMBER (+1)
            long amountVal = tx.getAmount().longValue();
            if (amountVal >= 100000 && amountVal % 10000 == 0) {
                flags.add("ROUND_NUMBER");
                severityScore += 1;
            }

            // 2. DUPLICATE (+3)
            boolean isDuplicate = false;
            for (int j = 0; j < transactions.size(); j++) {
                if (i == j) continue;
                Transaction otherTx = transactions.get(j);
                if (tx.getVendorName() != null && tx.getVendorName().equals(otherTx.getVendorName())
                        && tx.getAmount().compareTo(otherTx.getAmount()) == 0) {
                    long hours = Math.abs(ChronoUnit.HOURS.between(tx.getTransactionDate(), otherTx.getTransactionDate()));
                    if (hours <= 48) {
                        isDuplicate = true;
                        break;
                    }
                }
            }
            if (isDuplicate) {
                flags.add("DUPLICATE");
                severityScore += 3;
            }

            // 3. HIGH_VALUE (+2)
            if (tx.getAmount().compareTo(BigDecimal.valueOf(1000000)) > 0) {
                flags.add("HIGH_VALUE");
                severityScore += 2;
            }

            // 4. UNKNOWN_VENDOR (+2)
            if (tx.getVendorName() != null && !approvedVendorNames.contains(tx.getVendorName())) {
                flags.add("UNKNOWN_VENDOR");
                severityScore += 2;
            }

            // 5. WEEKEND_TIMING (+1)
            DayOfWeek day = tx.getTransactionDate().getDayOfWeek();
            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
                flags.add("WEEKEND_TIMING");
                severityScore += 1;
            }

            // 6. STATISTICAL_OUTLIER (+2)
            if (tx.getZScore() != null && Math.abs(tx.getZScore()) > 3.0) {
                flags.add("STATISTICAL_OUTLIER");
                severityScore += 2;
            }

            // 7. SPLIT_TRANSACTION (+3)
            if (tx.getAmount().compareTo(BigDecimal.valueOf(800000)) >= 0 &&
                tx.getAmount().compareTo(BigDecimal.valueOf(999999)) <= 0) {
                int splitCount = 1;
                for (int j = 0; j < transactions.size(); j++) {
                    if (i == j) continue;
                    Transaction otherTx = transactions.get(j);
                    if (tx.getVendorName() != null && tx.getVendorName().equals(otherTx.getVendorName())) {
                        if (otherTx.getAmount().compareTo(BigDecimal.valueOf(800000)) >= 0 &&
                            otherTx.getAmount().compareTo(BigDecimal.valueOf(999999)) <= 0) {
                            long hours = Math.abs(ChronoUnit.HOURS.between(tx.getTransactionDate(), otherTx.getTransactionDate()));
                            if (hours <= 24) {
                                splitCount++;
                            }
                        }
                    }
                }
                if (splitCount >= 3) {
                    flags.add("SPLIT_TRANSACTION");
                    severityScore += 3;
                }
            }

            // 8. BALANCE_MISMATCH (+3)
            if (tx.getBalanceBefore() != null && tx.getBalanceAfter() != null) {
                BigDecimal expectedAfter = tx.getBalanceBefore().subtract(tx.getAmount());
                if (expectedAfter.subtract(tx.getBalanceAfter()).abs().compareTo(BigDecimal.valueOf(0.01)) > 0) {
                    flags.add("BALANCE_MISMATCH");
                    severityScore += 3;
                }
            }

            // 9. MISSING_INVOICE (+1)
            if (tx.getInvoiceNumber() == null || tx.getInvoiceNumber().isBlank()) {
                flags.add("MISSING_INVOICE");
                severityScore += 1;
            }

            if (!flags.isEmpty()) {
                String severityBucket;
                if (severityScore >= 8) severityBucket = "CRITICAL";
                else if (severityScore >= 5) severityBucket = "HIGH";
                else if (severityScore >= 3) severityBucket = "MEDIUM";
                else severityBucket = "LOW";

                results.add(AnomalyResult.builder()
                        .transaction(tx)
                        .flags(flags)
                        .severityScore(severityScore)
                        .severity(severityBucket)
                        .build());
            }
        }

        return results;
    }
}
