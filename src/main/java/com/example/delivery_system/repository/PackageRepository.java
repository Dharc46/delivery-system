package com.example.delivery_system.repository;

import com.example.delivery_system.entity.Package;
import com.example.delivery_system.entity.Package.PackageStatus; // <--- THAY ĐỔI Ở ĐÂY
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByStatus(PackageStatus status);
    List<Package> findByDeliveryTripId(Long deliveryTripId);
}