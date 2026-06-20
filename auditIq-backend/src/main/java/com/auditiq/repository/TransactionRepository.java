package com.auditiq.repository;

import com.auditiq.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUploadId(Long uploadId);
    Page<Transaction> findByCompanyId(Long companyId, Pageable pageable);
    List<Transaction> findByVendorNameAndAmountAndTransactionDateBetween(
            String vendor, BigDecimal amount,
            LocalDateTime from, LocalDateTime to);
}
