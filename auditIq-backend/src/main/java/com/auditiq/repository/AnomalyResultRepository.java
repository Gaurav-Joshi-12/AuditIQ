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

    @org.springframework.data.jpa.repository.Query(value = """
        SELECT a.* FROM anomaly_result a
        JOIN transaction t ON a.transaction_fk = t.id
        WHERE t.company_id = :companyId AND a.embedding_text IS NOT NULL
        ORDER BY a.embedding_text::vector <=> CAST(:queryVector AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<AnomalyResult> findSimilar(
        @org.springframework.data.repository.query.Param("queryVector") String queryVector,
        @org.springframework.data.repository.query.Param("companyId") Long companyId,
        @org.springframework.data.repository.query.Param("limit") int limit
    );

    @org.springframework.data.jpa.repository.Query(value = """
        SELECT a.* FROM anomaly_result a
        JOIN transaction t ON a.transaction_fk = t.id
        WHERE t.upload_id = :uploadId AND a.embedding_text IS NOT NULL
        ORDER BY a.embedding_text::vector <=> CAST(:queryVector AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<AnomalyResult> findSimilarByUpload(
        @org.springframework.data.repository.query.Param("queryVector") String queryVector,
        @org.springframework.data.repository.query.Param("uploadId") Long uploadId,
        @org.springframework.data.repository.query.Param("limit") int limit
    );
}
