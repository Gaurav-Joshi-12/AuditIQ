package com.auditiq.service;

import com.auditiq.model.Transaction;
import com.auditiq.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<Transaction> getByUpload(Long uploadId) {
        return transactionRepository.findByUploadId(uploadId);
    }

    public Page<Transaction> getByCompany(Long companyId, Pageable pageable) {
        return transactionRepository.findByCompanyId(companyId, pageable);
    }
    
    public Transaction getTransaction(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }
}
