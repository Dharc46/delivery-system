package com.example.deliverysystem.controller;

import com.example.deliverysystem.dto.DeliveryTripDTO;
import com.example.deliverysystem.dto.OptimizeTripRequest;
import com.example.deliverysystem.model.TripStatus;
import com.example.deliverysystem.service.DeliveryTripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/delivery-trips")
@RequiredArgsConstructor
@Tag(name = "Admin - Delivery Trip Management", description = "API for Admin to optimize and manage delivery trips")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDeliveryTripController {

    private final DeliveryTripService deliveryTripService;

    @Operation(summary = "Optimize and create a new delivery trip")
    @PostMapping("/optimize")
    public ResponseEntity<DeliveryTripDTO> optimizeAndCreateDeliveryTrip(@RequestBody OptimizeTripRequest request) {
        DeliveryTripDTO createdTrip = deliveryTripService.optimizeAndCreateDeliveryTrip(request.getShipperId(), request.getPackageIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTrip);
    }

    @Operation(summary = "Get all delivery trips")
    @GetMapping
    public ResponseEntity<List<DeliveryTripDTO>> getAllDeliveryTrips() {
        List<DeliveryTripDTO> trips = deliveryTripService.getAllDeliveryTrips();
        return ResponseEntity.ok(trips);
    }

    @Operation(summary = "Get delivery trip by ID")
    @GetMapping("/{id}")
    public ResponseEntity<DeliveryTripDTO> getDeliveryTripById(@PathVariable Long id) {
        DeliveryTripDTO trip = deliveryTripService.getDeliveryTripById(id);
        return ResponseEntity.ok(trip);
    }

    @Operation(summary = "Update status of a delivery trip")
    @PutMapping("/{id}/status")
    public ResponseEntity<DeliveryTripDTO> updateDeliveryTripStatus(@PathVariable Long id, @RequestParam TripStatus status) {
        DeliveryTripDTO updatedTrip = deliveryTripService.updateDeliveryTripStatus(id, status);
        return ResponseEntity.ok(updatedTrip);
    }
}