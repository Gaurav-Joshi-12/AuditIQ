package com.auditiq.service.pipeline;

import com.auditiq.dto.response.PipelineResult;
import com.auditiq.model.AnomalyResult;
import com.auditiq.model.Transaction;
import com.auditiq.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditPipelineCoordinator {

    private final IngestionAgent ingestionAgent;
    private final PreprocessingAgent preprocessingAgent;
    private final AnomalyDetectionAgent anomalyDetectionAgent;
    private final ExplanationAgent explanationAgent;
    private final KnowledgeBaseWriter knowledgeBaseWriter;
    private final TransactionRepository transactionRepository;
    private final com.auditiq.repository.CompanyRepository companyRepository;

    public PipelineResult run(MultipartFile file, Long uploadId, Long companyId, String fileType) throws Exception {
        log.info("Starting audit pipeline for uploadId: {}", uploadId);

        com.auditiq.model.Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));

        // 1. Ingestion
        List<Transaction> transactions = ingestionAgent.parse(file, uploadId, fileType);
        for (Transaction t : transactions) {
            t.setCompany(company);
        }
        int totalRows = transactions.size();
        log.info("Parsed {} transactions", totalRows);

        // 2. Preprocessing
        transactions = preprocessingAgent.process(transactions);

        // 3. Save all transactions
        transactions = transactionRepository.saveAll(transactions);
        log.info("Saved transactions to database");

        // 4. Anomaly Detection
        List<AnomalyResult> anomalyResults = anomalyDetectionAgent.detect(transactions, companyId);
        int flaggedCount = anomalyResults.size();
        log.info("Detected {} anomalies", flaggedCount);

        // 5. Explanation
        explanationAgent.explain(anomalyResults);

        // 6. KnowledgeBaseWriter
        knowledgeBaseWriter.save(anomalyResults);

        log.info("Audit pipeline completed for uploadId: {}", uploadId);

        return PipelineResult.builder()
                .totalRows(totalRows)
                .flaggedCount(flaggedCount)
                .anomalyResults(anomalyResults)
                .build();
    }
}
