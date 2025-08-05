package com.example.deliverysystem.controller;

import com.example.deliverysystem.dto.ShipperDTO;
import com.example.deliverysystem.service.ShipperService;
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
@RequestMapping("/api/v1/admin/shippers")
@RequiredArgsConstructor
@Tag(name = "Admin - Shipper Management", description = "API for Admin to manage shippers")
@SecurityRequirement(name = "bearerAuth") // Yêu cầu JWT token [cite: 6]
@PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN được phép truy cập controller này [cite: 28]
public class AdminShipperController {

    private final ShipperService shipperService;

    @Operation(summary = "Create a new shipper")
    @PostMapping
    public ResponseEntity<ShipperDTO> createShipper(@Valid @RequestBody ShipperDTO shipperDTO) {
        ShipperDTO createdShipper = shipperService.createShipper(shipperDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdShipper);
    }

    @Operation(summary = "Get all shippers")
    @GetMapping
    public ResponseEntity<List<ShipperDTO>> getAllShippers() {
        List<ShipperDTO> shippers = shipperService.getAllShippers();
        return ResponseEntity.ok(shippers);
    }

    @Operation(summary = "Get shipper by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ShipperDTO> getShipperById(@PathVariable Long id) {
        ShipperDTO shipper = shipperService.getShipperById(id);
        return ResponseEntity.ok(shipper);
    }

    @Operation(summary = "Update an existing shipper")
    @PutMapping("/{id}")
    public ResponseEntity<ShipperDTO> updateShipper(@PathVariable Long id, @Valid @RequestBody ShipperDTO shipperDTO) {
        ShipperDTO updatedShipper = shipperService.updateShipper(id, shipperDTO);
        return ResponseEntity.ok(updatedShipper);
    }

    @Operation(summary = "Delete a shipper by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipper(@PathVariable Long id) {
        shipperService.deleteShipper(id);
        return ResponseEntity.noContent().build();
    }
}