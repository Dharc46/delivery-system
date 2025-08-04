package com.example.deliverysystem.repository;

import com.example.deliverysystem.model.Package;
import com.example.deliverysystem.model.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByStatus(PackageStatus status);
    List<Package> findByDeliveryTripShipperId(Long shipperId);
    List<Package> findByReceiverInfoContaining(String receiverPhone); // Để tìm kiếm theo SĐT người nhận [cite: 26]
}