package com.example.delivery_system.controller;

import com.example.delivery_system.dto.PackageDTO;
import com.example.delivery_system.service.PackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
public class PackageController {
    private final PackageService packageService;

    @Operation(summary = "Create a new package", description = "Creates a new package with provided details")
    @ApiResponse(responseCode = "200", description = "Package created successfully")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageDTO> createPackage(@RequestBody PackageDTO dto) {
        return ResponseEntity.ok(packageService.createPackage(dto));
    }

    @Operation(summary = "Get all packages", description = "Retrieves a list of all packages")
    @ApiResponse(responseCode = "200", description = "List of packages retrieved successfully")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PackageDTO>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }
}