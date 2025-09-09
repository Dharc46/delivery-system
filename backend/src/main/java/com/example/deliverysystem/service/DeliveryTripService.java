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
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryTripService {

    private final DeliveryTripRepository deliveryTripRepository;
    private final ShipperRepository shipperRepository;
    private final PackageRepository packageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Optional<DeliveryTripDTO> findActiveTripForToday(Long shipperId) {
        List<DeliveryTrip> trips = deliveryTripRepository.findByShipperIdAndTripDate(shipperId, LocalDate.now());
        return trips.stream()
                .max(Comparator.comparingLong(DeliveryTrip::getId))
                .map(this::convertToDTO);
    }

    public DeliveryTripDTO getDeliveryTripById(Long id) {
        DeliveryTrip trip = deliveryTripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryTrip not found with id " + id));
        return convertToDTO(trip);
    }

    public DeliveryTripDTO updateDeliveryTripStatus(Long id, TripStatus status) {
        DeliveryTrip trip = deliveryTripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryTrip not found with id " + id));
        trip.setStatus(status);
        deliveryTripRepository.save(trip);
        return convertToDTO(trip);
    }

    public List<DeliveryTripDTO> getAllDeliveryTrips() {
        // lấy toàn bộ trip và sort theo id giảm dần cho ổn định
        return deliveryTripRepository.findAll().stream()
                .sorted(Comparator.comparingLong(DeliveryTrip::getId).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryTripDTO optimizeAndCreateTrip(Long shipperId, List<Long> packageIds) {
        if (packageIds == null || packageIds.isEmpty()) {
            throw new IllegalArgumentException("packageIds must not be empty");
        }

        Shipper shipper = shipperRepository.findById(shipperId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipper not found with id " + shipperId));

        List<Package> packages = packageRepository.findAllById(packageIds);
        if (packages.size() != packageIds.size()) {
            throw new ResourceNotFoundException("Some packages were not found");
        }
        packages.forEach(p -> {
            if (p.getLatitude() == null || p.getLongitude() == null) {
                throw new IllegalArgumentException("Package " + p.getId() + " has no coordinates");
            }
        });

        // Simple nearest-neighbor to order stops
        double startLat = shipper.getCurrentLatitude() != null ? shipper.getCurrentLatitude() : 0d;
        double startLng = shipper.getCurrentLongitude() != null ? shipper.getCurrentLongitude() : 0d;

        List<Point> points = packages.stream()
                .map(p -> new Point(p.getId(), p.getLatitude(), p.getLongitude()))
                .collect(Collectors.toList());

        List<Point> ordered = nearestNeighbor(startLat, startLng, points);

        // Build lightweight route JSON for FE (LineString + stops + summary)
        double speedKmh = 30.0;
        double traveledKm = 0.0;
        long totalSec = 0L;
        Instant base = Instant.now();

        List<List<Double>> coordinates = new ArrayList<>();
        coordinates.add(Arrays.asList(startLng, startLat));

        List<Map<String, Object>> stops = new ArrayList<>();
        double curLat = startLat, curLng = startLng;
        for (int i = 0; i < ordered.size(); i++) {
            Point pt = ordered.get(i);
            traveledKm += haversineKm(curLat, curLng, pt.lat, pt.lng);
            long secs = (long) ((traveledKm / speedKmh) * 3600);
            totalSec = secs;
            Instant eta = base.plusSeconds(secs);

            coordinates.add(Arrays.asList(pt.lng, pt.lat));

            Map<String, Object> stop = new LinkedHashMap<>();
            stop.put("seq", i + 1);
            stop.put("packageId", pt.id);
            stop.put("lat", pt.lat);
            stop.put("lng", pt.lng);
            stop.put("eta", eta.toString());
            stops.add(stop);

            curLat = pt.lat; curLng = pt.lng;
        }

        Map<String, Object> route = new LinkedHashMap<>();
        route.put("type", "LineString");
        route.put("coordinates", coordinates);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalDistanceMeters", Math.round(traveledKm * 1000));
        summary.put("totalDurationSeconds", totalSec);

        Map<String, Object> optimized = new LinkedHashMap<>();
        optimized.put("route", route);
        optimized.put("stops", stops);
        optimized.put("summary", summary);

        String optimizedJson;
        try {
            optimizedJson = objectMapper.writeValueAsString(optimized);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize optimized route", e);
        }

        DeliveryTrip trip = new DeliveryTrip();
        trip.setTripDate(LocalDate.now());
        trip.setStatus(TripStatus.PENDING);
        trip.setShipper(shipper);
        trip.setOptimizedRouteData(optimizedJson);
        trip = deliveryTripRepository.save(trip);

        for (Package p : packages) {
            p.setDeliveryTrip(trip);
        }
        packageRepository.saveAll(packages);

        return convertToDTO(trip);
    }

    private static class Point {
        final Long id; final double lat; final double lng;
        Point(Long id, double lat, double lng) { this.id = id; this.lat = lat; this.lng = lng; }
    }

    private static List<Point> nearestNeighbor(double startLat, double startLng, List<Point> points) {
        List<Point> remaining = new ArrayList<>(points);
        List<Point> order = new ArrayList<>();
        double curLat = startLat, curLng = startLng;
        while (!remaining.isEmpty()) {
            Point best = null; double bestD = Double.MAX_VALUE;
            for (Point p : remaining) {
                double d = haversineKm(curLat, curLng, p.lat, p.lng);
                if (d < bestD) { bestD = d; best = p; }
            }
            order.add(best);
            curLat = best.lat; curLng = best.lng;
            remaining.remove(best);
        }
        return order;
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.pow(Math.sin(dLon / 2), 2);
        return 2 * R * Math.asin(Math.sqrt(a));
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
