package com.example.deliverysystem.service;

import com.example.deliverysystem.dto.ShipperDTO;
import com.example.deliverysystem.dto.UserDTO;
import com.example.deliverysystem.exception.ResourceNotFoundException;
import com.example.deliverysystem.model.Role;
import com.example.deliverysystem.model.Shipper;
import com.example.deliverysystem.model.User;
import com.example.deliverysystem.repository.ShipperRepository;
import com.example.deliverysystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipperService {

    private final ShipperRepository shipperRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional // Đảm bảo tính toàn vẹn dữ liệu [cite: 29]
    public ShipperDTO createShipper(ShipperDTO shipperDTO) {
        // Tạo tài khoản User cho Shipper
        User user = new User();
        user.setUsername(shipperDTO.getUsername()); // Username của shipper
        user.setPassword(passwordEncoder.encode(shipperDTO.getPassword())); // Mã hóa mật khẩu
        user.setRole(Role.ROLE_SHIPPER); // Gán vai trò SHIPPER
        User savedUser = userRepository.save(user);

        // Tạo Shipper
        Shipper shipper = new Shipper();
        shipper.setFullName(shipperDTO.getFullName());
        shipper.setPhoneNumber(shipperDTO.getPhoneNumber());
        shipper.setCurrentLatitude(shipperDTO.getCurrentLatitude());
        shipper.setCurrentLongitude(shipperDTO.getCurrentLongitude());
        shipper.setUser(savedUser); // Liên kết với User đã tạo
        Shipper savedShipper = shipperRepository.save(shipper);
        return convertToDTO(savedShipper);
    }

    public List<ShipperDTO> getAllShippers() {
        return shipperRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ShipperDTO getShipperById(Long id) {
        Shipper shipper = shipperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipper not found with id: " + id));
        return convertToDTO(shipper);
    }

    @Transactional
    public ShipperDTO updateShipper(Long id, ShipperDTO shipperDTO) {
        Shipper existingShipper = shipperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipper not found with id: " + id));

        existingShipper.setFullName(shipperDTO.getFullName());
        existingShipper.setPhoneNumber(shipperDTO.getPhoneNumber());
        existingShipper.setCurrentLatitude(shipperDTO.getCurrentLatitude());
        existingShipper.setCurrentLongitude(shipperDTO.getCurrentLongitude());
        // Có thể update thông tin user nếu cần, ví dụ: username, password
        if (shipperDTO.getUsername() != null) {
            existingShipper.getUser().setUsername(shipperDTO.getUsername());
        }
        if (shipperDTO.getPassword() != null) {
            existingShipper.getUser().setPassword(passwordEncoder.encode(shipperDTO.getPassword()));
        }
        userRepository.save(existingShipper.getUser());
        Shipper updatedShipper = shipperRepository.save(existingShipper);
        return convertToDTO(updatedShipper);
    }

    @Transactional
    public void deleteShipper(Long id) {
        Shipper shipper = shipperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipper not found with id: " + id));
        userRepository.delete(shipper.getUser()); // Xóa cả tài khoản User liên quan
        shipperRepository.delete(shipper);
    }

    private ShipperDTO convertToDTO(Shipper shipper) {
        ShipperDTO dto = new ShipperDTO();
        dto.setId(shipper.getId());
        dto.setFullName(shipper.getFullName());
        dto.setPhoneNumber(shipper.getPhoneNumber());
        dto.setCurrentLatitude(shipper.getCurrentLatitude());
        dto.setCurrentLongitude(shipper.getCurrentLongitude());
        if (shipper.getUser() != null) {
            dto.setUsername(shipper.getUser().getUsername());
            // Không trả về password
        }
        return dto;
    }
}