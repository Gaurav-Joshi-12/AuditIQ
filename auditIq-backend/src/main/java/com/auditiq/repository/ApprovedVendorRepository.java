package com.auditiq.repository;

import com.auditiq.model.ApprovedVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApprovedVendorRepository extends JpaRepository<ApprovedVendor, Long> {
    Optional<ApprovedVendor> findByVendorNameAndCompanyId(String vendorName, Long companyId);
    List<ApprovedVendor> findByCompanyId(Long companyId);
}
