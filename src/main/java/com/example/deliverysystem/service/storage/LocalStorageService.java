package com.example.deliverysystem.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct; // Import này

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID; // Import này

@Service
public class LocalStorageService implements FileService {

    @Value("${file.upload-dir}") // Cấu hình đường dẫn trong application.properties
    private String uploadDir;

    private Path foundFile;

    @PostConstruct // Đảm bảo thư mục được tạo khi ứng dụng khởi động
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to store empty file.");
        }

        // Tạo tên file duy nhất để tránh trùng lặp
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = Paths.get(uploadDir, fileName);

        Files.copy(file.getInputStream(), filePath); // Lưu file

        // Trả về URL của file, bạn có thể cần một base URL cho server của mình
        // Ví dụ: http://localhost:8080/files/ + fileName
        // Tạm thời trả về tên file để sau này controller có thể xây dựng URL đầy đủ
        return fileName;
    }

    @Override
    public byte[] downloadFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        if (Files.exists(filePath)) {
            return Files.readAllBytes(filePath);
        } else {
            throw new IOException("File not found: " + fileName);
        }
    }

    @Override
    public boolean deleteFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        return Files.deleteIfExists(filePath);
    }
}