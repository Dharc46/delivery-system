package com.example.deliverysystem.service;

import com.example.deliverysystem.dto.CodReconciliationDailyReportDTO;
import com.example.deliverysystem.dto.CodReconciliationPackageDTO;
import com.example.deliverysystem.dto.CodReconciliationReportDTO;
import com.example.deliverysystem.dto.CodReconciliationShipperReportDTO;
import com.example.deliverysystem.dto.CodReconciliationTripReportDTO;
import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.Package;
import com.example.deliverysystem.model.PackageStatus;
import com.example.deliverysystem.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.TreeMap;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodReconciliationService {

    private final PackageRepository packageRepository;

    public CodReconciliationReportDTO getReconciliationReport(LocalDate fromDate, LocalDate toDate) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;

        List<Package> packages = (fromInstant != null && toInstant != null)
                ? packageRepository.findByReconciledTrueAndReconciledAtBetweenOrderByReconciledAtDesc(fromInstant, toInstant)
                : packageRepository.findByReconciledTrueOrderByReconciledAtDesc();

        CodReconciliationReportDTO report = new CodReconciliationReportDTO();
        report.setPackageCount(packages.size());
        report.setTotalCodAmount(packages.stream().mapToDouble(pkg -> pkg.getCodAmount() != null ? pkg.getCodAmount() : 0.0).sum());

        Map<LocalDate, Map<Long, Map<Long, CodReconciliationTripReportDTO>>> grouped = new TreeMap<>();
        Map<Long, String> shipperNames = new LinkedHashMap<>();

        for (Package pkg : packages) {
            if (pkg.getDeliveryTrip() == null || pkg.getDeliveryTrip().getShipper() == null || pkg.getReconciledAt() == null) {
                continue;
            }

            LocalDate day = pkg.getReconciledAt().atZone(ZoneId.systemDefault()).toLocalDate();
            Long shipperId = pkg.getDeliveryTrip().getShipper().getId();
            String shipperName = pkg.getDeliveryTrip().getShipper().getFullName();
            Long tripId = pkg.getDeliveryTrip().getId();

            shipperNames.putIfAbsent(shipperId, shipperName);

            grouped
                .computeIfAbsent(day, key -> new TreeMap<>())
                .computeIfAbsent(shipperId, key -> new TreeMap<>())
                .computeIfAbsent(tripId, key -> {
                    CodReconciliationTripReportDTO tripReport = new CodReconciliationTripReportDTO();
                    tripReport.setTripId(tripId);
                    tripReport.setTripDate(pkg.getDeliveryTrip().getTripDate());
                    tripReport.setShipperId(shipperId);
                    tripReport.setShipperName(shipperName);
                    return tripReport;
                });

            CodReconciliationTripReportDTO tripReport = grouped.get(day).get(shipperId).get(tripId);
            CodReconciliationPackageDTO packageReport = new CodReconciliationPackageDTO();
            packageReport.setPackageId(pkg.getId());
            packageReport.setCodAmount(pkg.getCodAmount());
            packageReport.setStatus(pkg.getStatus());
            packageReport.setReconciledAt(pkg.getReconciledAt());
            packageReport.setReconciledBy(pkg.getReconciledBy());
            tripReport.getPackages().add(packageReport);
            tripReport.setPackageCount(tripReport.getPackageCount() + 1);
            tripReport.setTotalCodAmount(tripReport.getTotalCodAmount() + (pkg.getCodAmount() != null ? pkg.getCodAmount() : 0.0));
        }

        for (Map.Entry<LocalDate, Map<Long, Map<Long, CodReconciliationTripReportDTO>>> dayEntry : grouped.entrySet()) {
            CodReconciliationDailyReportDTO dayReport = new CodReconciliationDailyReportDTO();
            dayReport.setDate(dayEntry.getKey());

            for (Map.Entry<Long, Map<Long, CodReconciliationTripReportDTO>> shipperEntry : dayEntry.getValue().entrySet()) {
                CodReconciliationShipperReportDTO shipperReport = new CodReconciliationShipperReportDTO();
                shipperReport.setShipperId(shipperEntry.getKey());
                shipperReport.setShipperName(shipperNames.get(shipperEntry.getKey()));

                for (CodReconciliationTripReportDTO tripReport : shipperEntry.getValue().values()) {
                    shipperReport.getTrips().add(tripReport);
                    shipperReport.setPackageCount(shipperReport.getPackageCount() + tripReport.getPackageCount());
                    shipperReport.setTotalCodAmount(shipperReport.getTotalCodAmount() + tripReport.getTotalCodAmount());
                }

                dayReport.getShippers().add(shipperReport);
                dayReport.setPackageCount(dayReport.getPackageCount() + shipperReport.getPackageCount());
                dayReport.setTotalCodAmount(dayReport.getTotalCodAmount() + shipperReport.getTotalCodAmount());
            }

            report.getDays().add(dayReport);
        }

        return report;
    }

    // Lấy các đơn hàng đã giao thành công và có COD để đối soát
    @Cacheable(value = "cod:pending", key = "'pending'")
    public List<Package> getPackagesForCodReconciliation() {
        return packageRepository.findByStatusAndReconciledFalse(PackageStatus.DELIVERED).stream()
                .filter(p -> p.getCodAmount() != null && p.getCodAmount() > 0)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"cod:pending", "dashboard:stats"}, allEntries = false)
    public String confirmCodReconciliation(List<Long> packageIds, Authentication authentication) {
        int reconciledCount = 0;
        double totalCodAmount = 0.0;
        String reconciledBy = authentication != null ? authentication.getName() : "system";

        for (Long packageId : new LinkedHashSet<>(packageIds)) {
            Package pkg = packageRepository.findByIdAndReconciledFalse(packageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));

            if (pkg.getStatus() != PackageStatus.DELIVERED) {
                throw new IllegalArgumentException("Package " + packageId + " is not delivered yet");
            }

            if (pkg.getCodAmount() == null || pkg.getCodAmount() <= 0) {
                throw new IllegalArgumentException("Package " + packageId + " has no COD amount to reconcile");
            }

            pkg.setReconciled(true);
            pkg.setReconciledAt(Instant.now());
            pkg.setReconciledBy(reconciledBy);
            packageRepository.save(pkg);

            reconciledCount++;
            totalCodAmount += pkg.getCodAmount();
        }
        return String.format("Successfully reconciled %d packages with total COD amount: %.2f", reconciledCount, totalCodAmount);
    }
}