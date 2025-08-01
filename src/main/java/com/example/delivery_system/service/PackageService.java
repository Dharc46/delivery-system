package com.example.delivery_system.service;

import com.example.delivery_system.dto.PackageDTO;
import com.example.delivery_system.entity.Package;
import com.example.delivery_system.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
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
    public PackageDTO createPackage(PackageDTO dto) {
        Package pkg = new Package();
        mapDtoToEntity(dto, pkg);
        Package saved = packageRepository.save(pkg);
        return mapEntityToDto(saved);
    }

    @Cacheable(value = "packages")
    public List<PackageDTO> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(PackageDTO dto, Package pkg) {
        pkg.setSenderInfo(dto.getSenderInfo());
        pkg.setReceiverInfo(dto.getReceiverInfo());
        pkg.setLatitude(dto.getLatitude());
        pkg.setLongitude(dto.getLongitude());
        pkg.setPackageDetails(dto.getPackageDetails());
        pkg.setCodAmount(dto.getCodAmount());
        pkg.setStatus(dto.getStatus());
        pkg.setNotes(dto.getNotes());
        pkg.setProofOfDeliveryUrl(dto.getProofOfDeliveryUrl());
    }

    private PackageDTO mapEntityToDto(Package pkg) {
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
        return dto;
    }
}