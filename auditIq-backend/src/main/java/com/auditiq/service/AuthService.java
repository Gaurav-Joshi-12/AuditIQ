package com.auditiq.service;

import com.auditiq.dto.request.LoginRequest;
import com.auditiq.dto.request.RegisterRequest;
import com.auditiq.dto.response.AuthResponse;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    // TODO: implement once Spring Security + JWT dependencies are added
    public AuthResponse register(RegisterRequest request) {
        throw new UnsupportedOperationException("Auth not implemented yet");
    }

    public AuthResponse login(LoginRequest request) {
        throw new UnsupportedOperationException("Auth not implemented yet");
    }
}
