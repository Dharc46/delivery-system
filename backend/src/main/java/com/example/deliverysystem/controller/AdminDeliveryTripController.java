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

import java.util.Optional;

@Tag(name = "Admin Delivery Trips", description = "Optimize routes and manage delivery trips")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/delivery-trips")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDeliveryTripController {

    private final DeliveryTripService deliveryTripService;

    @Operation(summary = "Optimize and create a new delivery trip")
    @PostMapping("/optimize")
    public ResponseEntity<DeliveryTripDTO> optimize(@RequestBody OptimizeTripRequest request) {
        DeliveryTripDTO dto = deliveryTripService.optimizeAndCreateTrip(request.getShipperId(), request.getPackageIds());
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @Operation(summary = "Get active delivery trip for a shipper (today)")
    @GetMapping("/active")
    public ResponseEntity<DeliveryTripDTO> getActiveForShipper(@RequestParam Long shipperId) {
        Optional<DeliveryTripDTO> trip = deliveryTripService.findActiveTripForToday(shipperId);
        return trip.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
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
