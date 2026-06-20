package com.auditiq.service.pipeline;

import com.auditiq.model.AnomalyResult;
import com.auditiq.repository.AnomalyResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class KnowledgeBaseWriter {

    private final AnomalyResultRepository anomalyResultRepository;
    private final com.auditiq.service.EmbeddingService embeddingService;

    public void save(List<AnomalyResult> anomalyResults) {
        if (anomalyResults == null || anomalyResults.isEmpty()) {
            return;
        }
        
        for (AnomalyResult res : anomalyResults) {
            res.setDetectedAt(LocalDateTime.now());
            
            String embeddingText = buildEmbeddingText(res, res.getTransaction());
            String vectorLiteral = embeddingService.embed(embeddingText);
            res.setEmbeddingText(vectorLiteral);
        }
        
        anomalyResultRepository.saveAll(anomalyResults);
        log.info("Saved {} anomalies to the database with embeddings.", anomalyResults.size());
    }

    private String buildEmbeddingText(AnomalyResult a, com.auditiq.model.Transaction t) {
        return String.format(
            "Vendor: %s | Department: %s | Amount: Rs.%s | Date: %s | " +
            "Category: %s | Payment Mode: %s | Severity: %s | Flags: %s | " +
            "Explanation: %s",
            t.getVendorName(), t.getDepartment(), t.getAmount(),
            t.getTransactionDate(), t.getCategory(), t.getPaymentMode(),
            a.getSeverity(), String.join(", ", a.getFlags()), a.getExplanation()
        );
    }
}
