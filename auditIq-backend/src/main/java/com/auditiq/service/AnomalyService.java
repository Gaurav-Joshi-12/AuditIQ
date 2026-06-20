package com.auditiq.service;

import com.auditiq.model.AnomalyResult;
import com.auditiq.repository.AnomalyResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnomalyService {

    private final AnomalyResultRepository anomalyResultRepository;

    public List<AnomalyResult> getByUpload(Long uploadId) {
        return anomalyResultRepository.findByTransactionUploadId(uploadId);
    }

    public List<AnomalyResult> getBySeverity(String severity) {
        return anomalyResultRepository.findBySeverity(severity);
    }

    public Map<String, Long> getSeveritySummary(Long companyId) {
        List<AnomalyResult> results = anomalyResultRepository.findByTransactionCompanyId(companyId);
        Map<String, Long> summary = new HashMap<>();
        summary.put("CRITICAL", 0L);
        summary.put("HIGH", 0L);
        summary.put("MEDIUM", 0L);
        summary.put("LOW", 0L);

        for (AnomalyResult result : results) {
            String severity = result.getSeverity();
            if (summary.containsKey(severity)) {
                summary.put(severity, summary.get(severity) + 1);
            }
        }
        return summary;
    }
}
