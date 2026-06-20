package com.auditiq.controller;

import com.auditiq.dto.request.LoginRequest;
import com.auditiq.dto.request.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // TODO: wire up once AuthService is implemented
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(501).body("Not implemented yet");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.status(501).body("Not implemented yet");
    }
}
