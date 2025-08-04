package com.example.deliverysystem.controller;

import com.example.deliverysystem.dto.PackageDTO;
import com.example.deliverysystem.service.PackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/packages")
@RequiredArgsConstructor
@Tag(name = "Admin - Package Management", description = "API for Admin to manage packages")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN được phép truy cập controller này [cite: 28]
public class AdminPackageController {

    private final PackageService packageService;

    @Operation(summary = "Create a new package")
    @PostMapping
    public ResponseEntity<PackageDTO> createPackage(@Valid @RequestBody PackageDTO packageDTO) {
        PackageDTO createdPackage = packageService.createPackage(packageDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPackage);
    }

    @Operation(summary = "Get all packages")
    @GetMapping
    public ResponseEntity<List<PackageDTO>> getAllPackages() {
        List<PackageDTO> packages = packageService.getAllPackages();
        return ResponseEntity.ok(packages);
    }

    @Operation(summary = "Get package by ID")
    @GetMapping("/{id}")
    public ResponseEntity<PackageDTO> getPackageById(@PathVariable Long id) {
        PackageDTO pkg = packageService.getPackageById(id);
        return ResponseEntity.ok(pkg);
    }

    @Operation(summary = "Update an existing package")
    @PutMapping("/{id}")
    public ResponseEntity<PackageDTO> updatePackage(@PathVariable Long id, @Valid @RequestBody PackageDTO packageDTO) {
        PackageDTO updatedPackage = packageService.updatePackage(id, packageDTO);
        return ResponseEntity.ok(updatedPackage);
    }

    @Operation(summary = "Delete a package by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}