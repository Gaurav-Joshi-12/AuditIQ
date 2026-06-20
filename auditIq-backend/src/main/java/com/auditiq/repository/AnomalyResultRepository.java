package com.auditiq.repository;

import com.auditiq.model.AnomalyResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnomalyResultRepository extends JpaRepository<AnomalyResult, Long> {
    List<AnomalyResult> findByTransactionUploadId(Long uploadId);
    List<AnomalyResult> findBySeverity(String severity);
    List<AnomalyResult> findByTransactionCompanyId(Long companyId);
}
