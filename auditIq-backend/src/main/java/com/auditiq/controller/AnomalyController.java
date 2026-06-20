package com.auditiq.controller;

import com.auditiq.dto.response.AnomalyResponse;
import com.auditiq.model.AnomalyResult;
import com.auditiq.model.Transaction;
import com.auditiq.service.AnomalyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/anomalies")
@RequiredArgsConstructor
public class AnomalyController {

    private final AnomalyService anomalyService;

    @GetMapping("/upload/{uploadId}")
    public ResponseEntity<?> getByUpload(@PathVariable Long uploadId) {
        List<AnomalyResult> results = anomalyService.getByUpload(uploadId);
        return ResponseEntity.ok(results.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<?> getBySeverity(@PathVariable String severity) {
        List<AnomalyResult> results = anomalyService.getBySeverity(severity);
        return ResponseEntity.ok(results.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/summary/{companyId}")
    public ResponseEntity<?> getSummary(@PathVariable Long companyId) {
        return ResponseEntity.ok(anomalyService.getSeveritySummary(companyId));
    }

    private AnomalyResponse mapToResponse(AnomalyResult result) {
        Transaction tx = result.getTransaction();
        if (tx == null) {
            return AnomalyResponse.builder()
                    .anomalyId(result.getId())
                    .flags(result.getFlags())
                    .severity(result.getSeverity())
                    .severityScore(result.getSeverityScore())
                    .explanation(result.getExplanation())
                    .detectedAt(result.getDetectedAt())
                    .build();
        }
        return AnomalyResponse.builder()
                .anomalyId(result.getId())
                .transactionId(tx.getTransactionId())
                .vendorName(tx.getVendorName())
                .vendorId(tx.getVendorId())
                .department(tx.getDepartment())
                .amount(tx.getAmount())
                .ledgerType(tx.getLedgerType())
                .category(tx.getCategory())
                .balanceBefore(tx.getBalanceBefore())
                .balanceAfter(tx.getBalanceAfter())
                .transactionDate(tx.getTransactionDate())
                .paymentMode(tx.getPaymentMode())
                .flags(result.getFlags())
                .severity(result.getSeverity())
                .severityScore(result.getSeverityScore())
                .explanation(result.getExplanation())
                .detectedAt(result.getDetectedAt())
                .build();
    }
}
