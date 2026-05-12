package com.example.deliverysystem.service;

import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.Package;
import com.example.deliverysystem.model.PackageStatus;
import com.example.deliverysystem.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodReconciliationService {

    private final PackageRepository packageRepository;

    // Lấy các đơn hàng đã giao thành công và có COD để đối soát
    @Cacheable(value = "codReconciliation", key = "'pending'") // Cache kết quả 
    public List<Package> getPackagesForCodReconciliation() {
        return packageRepository.findByStatusAndReconciledFalse(PackageStatus.DELIVERED).stream()
                .filter(p -> p.getCodAmount() != null && p.getCodAmount() > 0)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"codReconciliation", "dashboardStats"}, allEntries = true) // Xóa cache sau khi đối soát
    public String confirmCodReconciliation(List<Long> packageIds, Authentication authentication) {
        int reconciledCount = 0;
        double totalCodAmount = 0.0;
        String reconciledBy = authentication != null ? authentication.getName() : "system";

        for (Long packageId : new LinkedHashSet<>(packageIds)) {
            Package pkg = packageRepository.findByIdAndReconciledFalse(packageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));

            if (pkg.getStatus() != PackageStatus.DELIVERED) {
                throw new IllegalArgumentException("Package " + packageId + " is not delivered yet");
            }

            if (pkg.getCodAmount() == null || pkg.getCodAmount() <= 0) {
                throw new IllegalArgumentException("Package " + packageId + " has no COD amount to reconcile");
            }

            pkg.setReconciled(true);
            pkg.setReconciledAt(Instant.now());
            pkg.setReconciledBy(reconciledBy);
            packageRepository.save(pkg);

            reconciledCount++;
            totalCodAmount += pkg.getCodAmount();
        }
        return String.format("Successfully reconciled %d packages with total COD amount: %.2f", reconciledCount, totalCodAmount);
    }
}