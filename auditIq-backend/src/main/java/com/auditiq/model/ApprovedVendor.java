package com.auditiq.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "approved_vendor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovedVendor {

    // private UUID id;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // stored uppercase
    private String vendorName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
}
