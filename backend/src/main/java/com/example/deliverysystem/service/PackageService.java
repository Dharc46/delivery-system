package com.example.deliverysystem.service;

import com.example.deliverysystem.dto.PackageDTO;
import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.DeliveryTrip;
import com.example.deliverysystem.model.Package;
import com.example.deliverysystem.model.PackageStatus;
import com.example.deliverysystem.model.Shipper;
import com.example.deliverysystem.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;

    @Transactional
    @CacheEvict(value = {"packages", "dashboardStats"}, allEntries = true) // Xóa cache khi thêm/sửa/xóa [cite: 35]
    public PackageDTO createPackage(PackageDTO packageDTO) {
        Package pkg = new Package();
        // Map DTO to Entity
        pkg.setSenderInfo(packageDTO.getSenderInfo());
        pkg.setReceiverInfo(packageDTO.getReceiverInfo());
        pkg.setLatitude(packageDTO.getLatitude());
        pkg.setLongitude(packageDTO.getLongitude());
        pkg.setPackageDetails(packageDTO.getPackageDetails());
        pkg.setCodAmount(packageDTO.getCodAmount());
        pkg.setStatus(PackageStatus.PENDING);
        pkg.setNotes(packageDTO.getNotes());
        pkg.setReconciled(false);

        Package savedPackage = packageRepository.save(pkg);
        return convertToDTO(savedPackage);
    }

    @Cacheable(value = "packages") // Cache danh sách đơn hàng [cite: 35, 62]
    public List<PackageDTO> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "packages", key = "#id")
    public PackageDTO getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
        return convertToDTO(pkg);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "packages", key = "'public-' + #id")
    public PackageDTO getPublicPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
        return convertToPublicDTO(pkg);
    }

    public PackageDTO getPackageForShipper(Long packageId, Long shipperId) {
        Package pkg = packageRepository.findByIdAndDeliveryTripShipperId(packageId, shipperId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId + " for shipperId: " + shipperId));
        return convertToDTO(pkg);
    }

    @Transactional
    @CacheEvict(value = {"packages", "dashboardStats"}, allEntries = true)
    public PackageDTO updatePackage(Long id, PackageDTO packageDTO) {
        Package existingPackage = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));

        if (packageDTO.getSenderInfo() != null) {
            existingPackage.setSenderInfo(packageDTO.getSenderInfo());
        }
        if (packageDTO.getReceiverInfo() != null) {
            existingPackage.setReceiverInfo(packageDTO.getReceiverInfo());
        }
        if (packageDTO.getLatitude() != null) {
            existingPackage.setLatitude(packageDTO.getLatitude());
        }
        if (packageDTO.getLongitude() != null) {
            existingPackage.setLongitude(packageDTO.getLongitude());
        }
        if (packageDTO.getPackageDetails() != null) {
            existingPackage.setPackageDetails(packageDTO.getPackageDetails());
        }
        if (packageDTO.getCodAmount() != null) {
            existingPackage.setCodAmount(packageDTO.getCodAmount());
        }
        if (packageDTO.getNotes() != null) {
            existingPackage.setNotes(packageDTO.getNotes());
        }
        if (packageDTO.getStatus() != null) {
            PackageStatus currentStatus = existingPackage.getStatus();
            if (!PackageStatus.isTransitionAllowed(currentStatus, packageDTO.getStatus())) {
                throw new IllegalArgumentException(
                        "Invalid package status transition from " + currentStatus + " to " + packageDTO.getStatus()
                );
            }
            existingPackage.setStatus(packageDTO.getStatus());
        }
        // proofOfDeliveryUrl và deliveryTrip sẽ được cập nhật bởi ShipperService/DeliveryTripService

        Package updatedPackage = packageRepository.save(existingPackage);
        return convertToDTO(updatedPackage);
    }

    @Transactional
    @CacheEvict(value = {"packages", "dashboardStats"}, allEntries = true)
    public void deletePackage(Long id) {
        packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
        packageRepository.deleteById(id);
    }

    private PackageDTO convertToDTO(Package pkg) {
        PackageDTO dto = new PackageDTO();
        dto.setId(pkg.getId());
        dto.setSenderInfo(pkg.getSenderInfo());
        dto.setReceiverInfo(pkg.getReceiverInfo());
        dto.setLatitude(pkg.getLatitude());
        dto.setLongitude(pkg.getLongitude());
        dto.setPackageDetails(pkg.getPackageDetails());
        dto.setCodAmount(pkg.getCodAmount());
        dto.setStatus(pkg.getStatus());
        dto.setNotes(pkg.getNotes());
        dto.setProofOfDeliveryUrl(pkg.getProofOfDeliveryUrl());
        dto.setReconciled(pkg.isReconciled());
        dto.setReconciledAt(pkg.getReconciledAt());
        dto.setReconciledBy(pkg.getReconciledBy());
        if (pkg.getDeliveryTrip() != null) {
            dto.setDeliveryTripId(pkg.getDeliveryTrip().getId());
        }
        return dto;
    }

    private PackageDTO convertToPublicDTO(Package pkg) {
        PackageDTO dto = convertToDTO(pkg);
        dto.setSenderInfo(null);
        dto.setReceiverInfo(null);
        dto.setLatitude(null);
        dto.setLongitude(null);
        dto.setPackageDetails(null);
        dto.setCodAmount(null);
        dto.setNotes(null);
        dto.setProofOfDeliveryUrl(null);
        dto.setReconciled(null);
        dto.setReconciledAt(null);
        dto.setReconciledBy(null);
        dto.setDeliveryTripId(null);
        applyTrackingInfo(dto, pkg);
        return dto;
    }

    private void applyTrackingInfo(PackageDTO dto, Package pkg) {
        DeliveryTrip trip = pkg.getDeliveryTrip();
        if (trip == null) {
            return;
        }

        Shipper shipper = trip.getShipper();
        if (shipper == null || shipper.getCurrentLatitude() == null || shipper.getCurrentLongitude() == null) {
            return;
        }

        if (pkg.getLatitude() == null || pkg.getLongitude() == null) {
            return;
        }

        double distanceKm = haversineKm(
                shipper.getCurrentLatitude(),
                shipper.getCurrentLongitude(),
                pkg.getLatitude(),
                pkg.getLongitude()
        );
        int etaMinutes = Math.max(1, (int) Math.ceil((distanceKm / 30.0) * 60.0));

        dto.setShipperLatitude(shipper.getCurrentLatitude());
        dto.setShipperLongitude(shipper.getCurrentLongitude());
        dto.setEstimatedDistanceKm(roundToTwoDecimals(distanceKm));
        dto.setEtaMinutes(etaMinutes);
        dto.setEstimatedArrivalAt(Instant.now().plusSeconds(etaMinutes * 60L));
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double radiusKm = 6371.0;
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);
        double a = Math.pow(Math.sin(deltaLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.pow(Math.sin(deltaLon / 2), 2);
        return 2 * radiusKm * Math.asin(Math.sqrt(a));
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}