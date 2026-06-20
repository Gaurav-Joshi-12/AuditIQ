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

    public void save(List<AnomalyResult> anomalyResults) {
        if (anomalyResults == null || anomalyResults.isEmpty()) {
            return;
        }
        
        for (AnomalyResult res : anomalyResults) {
            res.setDetectedAt(LocalDateTime.now());
        }
        
        anomalyResultRepository.saveAll(anomalyResults);
        log.info("Saved {} anomalies to the database.", anomalyResults.size());
    }
}
