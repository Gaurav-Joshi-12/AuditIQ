package com.auditiq.repository;

import com.auditiq.model.AuditReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditReportRepository extends JpaRepository<AuditReport, Long> {
    List<AuditReport> findByCompanyId(Long companyId);
}
