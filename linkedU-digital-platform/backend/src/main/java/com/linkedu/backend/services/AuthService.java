package com.linkedu.backend.services;

import com.linkedu.backend.dto.ContractRegistrationDTO;
import com.linkedu.backend.dto.GuestRegistrationDTO;
import com.linkedu.backend.dto.LoginRequestDTO;
import com.linkedu.backend.entities.EmailVerificationToken;
import com.linkedu.backend.entities.PasswordResetToken;
import com.linkedu.backend.entities.ProductKey;
import com.linkedu.backend.entities.User;
import com.linkedu.backend.dto.UserDTO;
import com.linkedu.backend.entities.enums.Role;
import com.linkedu.backend.repositories.EmailVerificationTokenRepository;
import com.linkedu.backend.repositories.ProductKeyRepository;
import com.linkedu.backend.repositories.UserRepository;
import com.linkedu.backend.repositories.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProductKeyRepository productKeyRepository;
    private final EmailVerificationTokenRepository emailTokenRepository;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    public ResponseEntity<?> authenticate(LoginRequestDTO dto) {
        User user = userRepository.findByEmailOrUsername(dto.getIdentifier(), dto.getIdentifier())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Please verify your email first"));
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole(),
                "message", "Login successful"
        ));
    }

    public ResponseEntity<?> registerWithContract(ContractRegistrationDTO dto) {
        // 1. Validate product key
        ProductKey productKey = productKeyRepository.findByKeyValue(dto.getProductKey())
                .orElseThrow(() -> new RuntimeException("Invalid product key"));

        if (productKey.isUsed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product key already used"));
        }

        // 2. Check email
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // 3. Create & SAVE USER FIRST (disabled until verified)
        User user = new User();
        user.setUsername(dto.getEmail());  // Auto username from email
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setBirthDate(LocalDate.parse(dto.getBirthDate()));
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.USER);
        user.setEnabled(false);  // ← Disabled until email verified!

        user = userRepository.save(user);

        // 4. Link ProductKey
        productKey.setUsed(true);
        productKey.setUser(user);
        productKeyRepository.save(productKey);

        // 5. SEND VERIFICATION EMAIL
        sendVerificationEmail(user);

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "message", "Contract user registered. Check your email for verification link!"
        ));
    }

    public ResponseEntity<?> registerAsGuest(GuestRegistrationDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent() ||
                userRepository.findByUsername(dto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email or username exists"));
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setBirthDate(LocalDate.parse(dto.getBirthDate()));
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.GUEST);
        user.setEnabled(false);  // ← Disabled until email verified!

        user = userRepository.save(user);

        // SEND VERIFICATION EMAIL
        sendVerificationEmail(user);

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "message", "Guest user registered. Check your email for verification link!"
        ));
    }

    public ResponseEntity<?> verifyEmail(String token) {
        var emailToken = emailTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (emailToken.getVerifiedAt() != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already verified"));
        }

        if (emailToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token expired"));
        }

        User user = userRepository.findById(emailToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        emailToken.setVerifiedAt(LocalDateTime.now());
        emailTokenRepository.save(emailToken);

        user.setEnabled(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now login."));
    }

    private void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        EmailVerificationToken emailToken = new EmailVerificationToken(token, user.getId());
        emailTokenRepository.save(emailToken);

        String verificationUrl = frontendUrl + "/verify?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationUrl);
    }

    public ResponseEntity<?> forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        // Always return success to prevent email enumeration attacks
        if (user == null) {
            return ResponseEntity.ok(Map.of("message",
                    "If this email exists, a reset link has been sent."));
        }

        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user.getId());
        passwordResetTokenRepository.save(resetToken);

        // Send email
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetUrl);

        return ResponseEntity.ok(Map.of("message",
                "If this email exists, a reset link has been sent."));
    }

    public ResponseEntity<?> resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElse(null);

        if (resetToken == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid reset token."));
        }

        if (resetToken.isUsed()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "This reset link has already been used."));
        }

        if (resetToken.isExpired()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "This reset link has expired. Please request a new one."));
        }

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters."));
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        return ResponseEntity.ok(Map.of("message",
                "Password reset successfully! You can now log in."));
    }
}
