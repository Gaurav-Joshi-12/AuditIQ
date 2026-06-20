package com.auditiq.repository;

import com.auditiq.model.Upload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UploadRepository extends JpaRepository<Upload, Long> {
    List<Upload> findByCompanyIdOrderByUploadedAtDesc(Long companyId);
    List<Upload> findByStatus(String status);
}
