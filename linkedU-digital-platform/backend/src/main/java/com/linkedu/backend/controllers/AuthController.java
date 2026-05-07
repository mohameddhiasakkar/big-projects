package com.linkedu.backend.controllers;

import com.linkedu.backend.dto.*;
import com.linkedu.backend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        return authService.authenticate(dto);
    }

    @PostMapping("/register/contract")
    public ResponseEntity<?> registerWithContract(@RequestBody ContractRegistrationDTO dto) {
        return authService.registerWithContract(dto);
    }

    @PostMapping("/register/guest")
    public ResponseEntity<?> registerAsGuest(@RequestBody GuestRegistrationDTO dto) {
        return authService.registerAsGuest(dto);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        return authService.verifyEmail(token);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Email is required."));
        }
        return authService.forgotPassword(email);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Token and new password are required."));
        }
        return authService.resetPassword(token, newPassword);
    }
}
