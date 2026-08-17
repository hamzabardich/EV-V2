package com.example.Routing_Ev.security.auth;

import com.example.Routing_Ev.entities.Utilisateur;
import com.example.Routing_Ev.repositories.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder; // ✅ AJOUT DE L'ENCODEUR
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationService service;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder; // ✅ AJOUT DE L'ENCODEUR

    public AuthController(AuthenticationService service, UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.service = service;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder; // ✅ INJECTION
    }

    @PostMapping("/register")
    public ResponseEntity<AuthObjets.AuthenticationResponse> register(@RequestBody AuthObjets.RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthObjets.AuthenticationResponse> authenticate(@RequestBody AuthObjets.AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
        }

        String email = authentication.getName();
        Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable");
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication, @RequestBody java.util.Map<String, String> updates) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
        }

        String emailActuel = authentication.getName();
        Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(emailActuel);

        if (userOpt.isPresent()) {
            Utilisateur user = userOpt.get();
            boolean needToRelogin = false;

            // 1. Nom
            if (updates.containsKey("nom") && !updates.get("nom").trim().isEmpty()) {
                user.setNom(updates.get("nom"));
            }

            // 2. Email
            if (updates.containsKey("email") && !updates.get("email").trim().isEmpty()) {
                String nouvelEmail = updates.get("email").trim();
                if (!nouvelEmail.equals(user.getEmail())) {
                    if (utilisateurRepository.findByEmail(nouvelEmail).isPresent()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cet email est déjà utilisé.");
                    }
                    user.setEmail(nouvelEmail);
                    needToRelogin = true;
                }
            }

            // 3. 🔒 NOUVEAU : Changement de mot de passe (seulement s'il est renseigné)
            if (updates.containsKey("password") && !updates.get("password").trim().isEmpty()) {
                String newPassword = updates.get("password").trim();
                // On hache le nouveau mot de passe avant de le sauvegarder
                user.setPassword(passwordEncoder.encode(newPassword));
            }

            utilisateurRepository.save(user);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("user", user);
            response.put("needToRelogin", needToRelogin);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable");
        }
    }
}