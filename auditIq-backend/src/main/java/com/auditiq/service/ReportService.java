package com.auditiq.service;

import com.auditiq.model.AnomalyResult;
import com.auditiq.model.Transaction;
import com.auditiq.model.Upload;
import com.auditiq.repository.AnomalyResultRepository;
import com.auditiq.repository.TransactionRepository;
import com.auditiq.repository.UploadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UploadRepository uploadRepository;
    private final TransactionRepository transactionRepository;
    private final AnomalyResultRepository anomalyResultRepository;
    private final AnomalyService anomalyService;

    /** Aggregated company-level dashboard summary */
    public Map<String, Object> getSummary(Long companyId) {
        Map<String, Object> summary = new HashMap<>();
        long totalUploads = uploadRepository.findByCompanyIdOrderByUploadedAtDesc(companyId).size();
        long totalTransactions = transactionRepository.findByCompanyId(companyId, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        Map<String, Long> severitySummary = anomalyService.getSeveritySummary(companyId);
        long totalFlagged = severitySummary.values().stream().mapToLong(Long::longValue).sum();

        summary.put("totalUploads", totalUploads);
        summary.put("totalTransactions", totalTransactions);
        summary.put("totalFlagged", totalFlagged);
        summary.put("severityBreakdown", severitySummary);

        return summary;
    }

    /** Per-upload aggregated metrics for the Org Reports page */
    public Map<String, Object> getUploadReport(Long uploadId) {
        Upload upload = uploadRepository.findById(uploadId)
                .orElseThrow(() -> new IllegalArgumentException("Upload not found: " + uploadId));

        List<Transaction> txns = transactionRepository.findByUploadId(uploadId);
        List<AnomalyResult> anomalies = anomalyResultRepository.findByTransactionUploadId(uploadId);

        BigDecimal totalValue = txns.stream()
                .map(Transaction::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal fraudAmount = anomalies.stream()
                .map(a -> a.getTransaction() != null ? a.getTransaction().getAmount() : BigDecimal.ZERO)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double avgRisk = anomalies.isEmpty() ? 0 :
                anomalies.stream().mapToInt(a -> a.getSeverityScore() != null ? a.getSeverityScore() : 0).average().orElse(0);

        long criticalCount = anomalies.stream().filter(a -> "CRITICAL".equals(a.getSeverity())).count();
        long highCount = anomalies.stream().filter(a -> "HIGH".equals(a.getSeverity())).count();
        long mediumCount = anomalies.stream().filter(a -> "MEDIUM".equals(a.getSeverity())).count();
        long lowCount = anomalies.stream().filter(a -> "LOW".equals(a.getSeverity())).count();

        Map<String, Object> report = new HashMap<>();
        report.put("uploadId", upload.getUploadId());
        report.put("fileName", upload.getFileName());
        report.put("uploadedAt", upload.getUploadedAt());
        report.put("status", upload.getStatus());
        report.put("sharedWithOrg", upload.getSharedWithOrg() != null && upload.getSharedWithOrg());
        report.put("totalTransactions", txns.size());
        report.put("totalValue", totalValue);
        report.put("flaggedCount", anomalies.size());
        report.put("fraudAmount", fraudAmount);
        report.put("avgRiskScore", Math.round(avgRisk * 12));  // 0-9 → 0-100 scale
        report.put("highRiskCount", criticalCount + highCount);
        report.put("criticalCount", criticalCount);
        report.put("highCount", highCount);
        report.put("mediumCount", mediumCount);
        report.put("lowCount", lowCount);

        return report;
    }
}
