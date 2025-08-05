package com.example.deliverysystem.service;

import com.example.deliverysystem.model.PackageStatus;
import com.example.deliverysystem.repository.PackageRepository;
import com.example.deliverysystem.repository.ShipperRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PackageRepository packageRepository;
    private final ShipperRepository shipperRepository;

    @Cacheable(value = "dashboardStats") // Cache thống kê
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalPackages = packageRepository.count();
        stats.put("totalPackages", totalPackages);

        // Thống kê theo trạng thái đơn hàng
        Map<PackageStatus, Long> packagesByStatus = new HashMap<>();
        for (PackageStatus status : PackageStatus.values()) {
            // Sửa lỗi ở đây: Ép kiểu int sang long
            packagesByStatus.put(status, (long) packageRepository.findByStatus(status).size());
        }
        stats.put("packagesByStatus", packagesByStatus);

        long deliveredPackages = packageRepository.findByStatus(PackageStatus.DELIVERED).size();
        stats.put("deliveredPackages", deliveredPackages);
        stats.put("deliverySuccessRate", totalPackages > 0 ? (double) deliveredPackages / totalPackages * 100 : 0.0);

        long totalShippers = shipperRepository.count();
        stats.put("totalShippers", totalShippers);

        // TODO: Thêm logic cho bản đồ thời gian thực (vị trí shipper) - cần WebSocket hoặc polling
        // TODO: Thêm báo cáo hiệu suất shipper (doanh thu, số đơn)

        return stats;
    }
}