package com.example.deliverysystem.service.storage;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileService {
    String uploadFile(MultipartFile file) throws IOException;
    byte[] downloadFile(String fileName) throws IOException;
    boolean deleteFile(String fileName) throws IOException;
}