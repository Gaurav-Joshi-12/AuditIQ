package com.auditiq.service.pipeline;

import com.auditiq.model.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
public class PreprocessingAgent {

    public List<Transaction> process(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return transactions;
        }

        double sum = 0.0;
        for (Transaction tx : transactions) {
            sum += tx.getAmount().doubleValue();
        }
        double mean = sum / transactions.size();

        double varianceSum = 0.0;
        for (Transaction tx : transactions) {
            double diff = tx.getAmount().doubleValue() - mean;
            varianceSum += (diff * diff);
        }
        double populationStdDev = Math.sqrt(varianceSum / transactions.size());

        for (Transaction tx : transactions) {
            // Trim and uppercase vendor name
            if (tx.getVendorName() != null) {
                tx.setVendorName(tx.getVendorName().trim().toUpperCase());
            }

            // Calculate zScore
            if (populationStdDev > 0) {
                double zScore = (tx.getAmount().doubleValue() - mean) / populationStdDev;
                tx.setZScore(zScore);
            } else {
                tx.setZScore(0.0);
            }

            // Enrichment
            if (tx.getCategory() == null || tx.getCategory().isBlank()) {
                String desc = (tx.getDepartment() != null ? tx.getDepartment().toUpperCase() : "") + " " +
                              (tx.getVendorName() != null ? tx.getVendorName().toUpperCase() : "");
                
                if (desc.contains("SALARY") || desc.contains("PAYROLL")) {
                    tx.setCategory("PAYROLL");
                } else if (desc.contains("GST") || desc.contains("TAX")) {
                    tx.setCategory("TAX");
                } else if (desc.contains("RENT")) {
                    tx.setCategory("RENT");
                } else if (desc.contains("TRAVEL") || desc.contains("FLIGHT") || desc.contains("HOTEL")) {
                    tx.setCategory("TRAVEL");
                } else {
                    tx.setCategory("VENDOR_PAYMENT");
                }
            }
        }

        return transactions;
    }
}
