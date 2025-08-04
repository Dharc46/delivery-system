package com.example.deliverysystem.service;

import com.example.deliverysystem.dto.PackageDTO;
import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.Package;
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
        pkg.setStatus(packageDTO.getStatus());
        pkg.setNotes(packageDTO.getNotes());

        Package savedPackage = packageRepository.save(pkg);
        return convertToDTO(savedPackage);
    }

    @Cacheable(value = "packages") // Cache danh sách đơn hàng [cite: 35, 62]
    public List<PackageDTO> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "packages", key = "#id")
    public PackageDTO getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
        return convertToDTO(pkg);
    }

    @Transactional
    @CacheEvict(value = {"packages", "dashboardStats"}, allEntries = true)
    public PackageDTO updatePackage(Long id, PackageDTO packageDTO) {
        Package existingPackage = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));

        // Update fields from DTO
        existingPackage.setSenderInfo(packageDTO.getSenderInfo());
        existingPackage.setReceiverInfo(packageDTO.getReceiverInfo());
        existingPackage.setLatitude(packageDTO.getLatitude());
        existingPackage.setLongitude(packageDTO.getLongitude());
        existingPackage.setPackageDetails(packageDTO.getPackageDetails());
        existingPackage.setCodAmount(packageDTO.getCodAmount());
        existingPackage.setStatus(packageDTO.getStatus());
        existingPackage.setNotes(packageDTO.getNotes());
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
        if (pkg.getDeliveryTrip() != null) {
            dto.setDeliveryTripId(pkg.getDeliveryTrip().getId());
        }
        return dto;
    }
}