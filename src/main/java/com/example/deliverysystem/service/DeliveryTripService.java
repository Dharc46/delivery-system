package com.example.deliverysystem.service;

import com.example.deliverysystem.dto.DeliveryTripDTO;
import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.DeliveryTrip;
import com.example.deliverysystem.model.Package;
import com.example.deliverysystem.model.Shipper;
import com.example.deliverysystem.model.TripStatus;
import com.example.deliverysystem.repository.DeliveryTripRepository;
import com.example.deliverysystem.repository.PackageRepository;
import com.example.deliverysystem.repository.ShipperRepository;
import com.fasterxml.jackson.databind.ObjectMapper; // Để chuyển đổi JSONB
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryTripService {

    private final DeliveryTripRepository deliveryTripRepository;
    private final ShipperRepository shipperRepository;
    private final PackageRepository packageRepository;
    private final ObjectMapper objectMapper; // Để xử lý JSONB

    // Phương thức này sẽ chứa logic gọi thư viện AI (OptaPlanner/OR-Tools)
    @Transactional
    @CacheEvict(value = {"deliveryTrips", "dashboardStats"}, allEntries = true)
    public DeliveryTripDTO optimizeAndCreateDeliveryTrip(Long shipperId, List<Long> packageIds) {
        Shipper shipper = shipperRepository.findById(shipperId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipper not found with id: " + shipperId));
        List<Package> packages = packageRepository.findAllById(packageIds);

        if (packages.isEmpty()) {
            throw new IllegalArgumentException("No packages provided for optimization.");
        }

        // TODO: Implement AI optimization logic here using OptaPlanner/OR-Tools 
        // This is a placeholder for the actual optimization process.
        // It should return a structured route (e.g., a list of package IDs in order, ETA, total distance).
        // For now, we'll just create a dummy optimized route.
        String optimizedRouteJson = "{\"route\": [" + packages.stream()
                .map(p -> String.valueOf(p.getId()))
                .collect(Collectors.joining(",")) + "], \"totalDistance\": 0.0, \"eta\": \"N/A\"}";
        try {
             // Validate JSON or create a proper object
        } catch (Exception e) {
            throw new RuntimeException("Error creating optimized route JSON", e);
        }


        DeliveryTrip deliveryTrip = new DeliveryTrip();
        deliveryTrip.setShipper(shipper);
        deliveryTrip.setTripDate(LocalDate.now());
        deliveryTrip.setStatus(TripStatus.PENDING); // Trạng thái ban đầu
        deliveryTrip.setOptimizedRouteData(optimizedRouteJson); // Lưu dữ liệu JSON đã tối ưu [cite: 23]

        DeliveryTrip savedTrip = deliveryTripRepository.save(deliveryTrip);

        // Cập nhật các đơn hàng thuộc về chuyến đi này
        for (Package pkg : packages) {
            pkg.setDeliveryTrip(savedTrip);
            packageRepository.save(pkg);
        }

        return convertToDTO(savedTrip);
    }

    @Cacheable(value = "deliveryTrips")
    public List<DeliveryTripDTO> getAllDeliveryTrips() {
        return deliveryTripRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "deliveryTrips", key = "#id")
    public DeliveryTripDTO getDeliveryTripById(Long id) {
        DeliveryTrip trip = deliveryTripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Trip not found with id: " + id));
        return convertToDTO(trip);
    }

    @Transactional
    @CacheEvict(value = {"deliveryTrips", "dashboardStats"}, allEntries = true)
    public DeliveryTripDTO updateDeliveryTripStatus(Long id, TripStatus status) {
        DeliveryTrip existingTrip = deliveryTripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Trip not found with id: " + id));
        existingTrip.setStatus(status);
        DeliveryTrip updatedTrip = deliveryTripRepository.save(existingTrip);
        return convertToDTO(updatedTrip);
    }

    private DeliveryTripDTO convertToDTO(DeliveryTrip trip) {
        DeliveryTripDTO dto = new DeliveryTripDTO();
        dto.setId(trip.getId());
        dto.setTripDate(trip.getTripDate());
        dto.setStatus(trip.getStatus());
        dto.setShipperId(trip.getShipper().getId());
        dto.setShipperName(trip.getShipper().getFullName());
        dto.setOptimizedRouteData(trip.getOptimizedRouteData());
        if (trip.getPackages() != null) {
            dto.setPackageIds(trip.getPackages().stream().map(Package::getId).collect(Collectors.toList()));
        }
        return dto;
    }
}