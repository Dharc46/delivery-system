package com.example.deliverysystem.service;

import com.example.deliverysystem.dto.ShipperDTO;
import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.Shipper;
import com.example.deliverysystem.model.User;
import com.example.deliverysystem.model.Role;
import com.example.deliverysystem.repository.ShipperRepository;
import com.example.deliverysystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShipperServiceTest {

    @Mock
    private ShipperRepository shipperRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ShipperService shipperService;

    private Shipper shipper;
    private User user;
    private ShipperDTO shipperDTO;

    @BeforeEach
    void setUp() {
        user = new User(1L, "shipper1", "encodedPassword", Role.ROLE_SHIPPER);
        shipper = new Shipper(1L, "Nguyen Van A", "0901234567", 10.0, 106.0, user);
        shipperDTO = new ShipperDTO();
        shipperDTO.setFullName("Nguyen Van A");
        shipperDTO.setPhoneNumber("0901234567");
        shipperDTO.setUsername("shipper1");
        shipperDTO.setPassword("password");
    }

    @Test
    void createShipper_Success() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(shipperRepository.save(any(Shipper.class))).thenReturn(shipper);

        ShipperDTO result = shipperService.createShipper(shipperDTO);

        assertNotNull(result);
        assertEquals(shipperDTO.getFullName(), result.getFullName());
        verify(userRepository, times(1)).save(any(User.class));
        verify(shipperRepository, times(1)).save(any(Shipper.class));
    }

    @Test
    void getShipperById_Found() {
        when(shipperRepository.findById(1L)).thenReturn(Optional.of(shipper));

        ShipperDTO result = shipperService.getShipperById(1L);

        assertNotNull(result);
        assertEquals(shipper.getFullName(), result.getFullName());
    }

    @Test
    void getShipperById_NotFound() {
        when(shipperRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> shipperService.getShipperById(99L));
    }

    @Test
    void deleteShipper_Success() {
        when(shipperRepository.findById(1L)).thenReturn(Optional.of(shipper));
        doNothing().when(userRepository).delete(any(User.class));
        doNothing().when(shipperRepository).delete(any(Shipper.class));

        shipperService.deleteShipper(1L);

        verify(userRepository, times(1)).delete(user);
        verify(shipperRepository, times(1)).delete(shipper);
    }

    @Test
    void deleteShipper_NotFound() {
        when(shipperRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> shipperService.deleteShipper(99L));
    }
}