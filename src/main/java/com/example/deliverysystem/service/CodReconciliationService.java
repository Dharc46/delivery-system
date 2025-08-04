package com.example.deliverysystem.service;

import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.Package;
import com.example.deliverysystem.model.PackageStatus;
import com.example.deliverysystem.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodReconciliationService {

    private final PackageRepository packageRepository;

    // Lấy các đơn hàng đã giao thành công và có COD để đối soát
    @Cacheable(value = "codReconciliation", key = "'pending'") // Cache kết quả 
    public List<Package> getPackagesForCodReconciliation() {
        // Lấy tất cả các đơn hàng đã DELIVERED và có COD (hoặc chưa được đối soát nếu có trường cờ)
        // Hiện tại, giả định tất cả các đơn hàng DELIVERED có COD cần được đối soát
        return packageRepository.findByStatus(PackageStatus.DELIVERED).stream()
                .filter(p -> p.getCodAmount() != null && p.getCodAmount() > 0)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"codReconciliation", "dashboardStats"}, allEntries = true) // Xóa cache sau khi đối soát
    public String confirmCodReconciliation(List<Long> packageIds) {
        int reconciledCount = 0;
        double totalCodAmount = 0.0;

        for (Long packageId : packageIds) {
            Package pkg = packageRepository.findById(packageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));

            // Chỉ xác nhận COD cho các đơn hàng đã giao thành công và có COD
            if (pkg.getStatus() == PackageStatus.DELIVERED && pkg.getCodAmount() != null && pkg.getCodAmount() > 0) {
                // TODO: Đánh dấu đơn hàng này là đã đối soát. Cần thêm một trường 'isReconciled' vào Package Entity
                // pkg.setIsReconciled(true);
                packageRepository.save(pkg);
                reconciledCount++;
                totalCodAmount += pkg.getCodAmount();
            }
        }
        return String.format("Successfully reconciled %d packages with total COD amount: %.2f", reconciledCount, totalCodAmount);
    }
}