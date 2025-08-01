package com.example.delivery_system;

import com.example.delivery_system.dto.PackageDTO;
import com.example.delivery_system.entity.Package;
import com.example.delivery_system.repository.PackageRepository;
import com.example.delivery_system.service.PackageService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PackageServiceTest {

    @Mock
    private PackageRepository packageRepository;

    @InjectMocks
    private PackageService packageService;

    @Test
    void testCreatePackage() {
        PackageDTO dto = new PackageDTO();
        dto.setSenderInfo("Sender");
        dto.setReceiverInfo("Receiver");
        Package pkg = new Package();
        pkg.setId(1L);
        pkg.setSenderInfo("Sender");
        pkg.setReceiverInfo("Receiver");

        when(packageRepository.save(any(Package.class))).thenReturn(pkg);

        PackageDTO result = packageService.createPackage(dto);
        assertEquals("Sender", result.getSenderInfo());
        assertEquals("Receiver", result.getReceiverInfo());
    }

    @Test
    void testGetAllPackages() {
        Package pkg = new Package();
        pkg.setId(1L);
        pkg.setSenderInfo("Sender");
        when(packageRepository.findAll()).thenReturn(List.of(pkg));

        List<PackageDTO> result = packageService.getAllPackages();
        assertEquals(1, result.size());
        assertEquals("Sender", result.get(0).getSenderInfo());
    }
}