package com.example.Routing_Ev.security.auth;

// Tous les imports doivent être ici, en haut du fichier
import com.example.Routing_Ev.entities.Utilisateur; // Vérifie que ce chemin correspond bien à ton projet
import com.example.Routing_Ev.repositories.UtilisateurRepository; // Pareil ici
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationService service;
    private final UtilisateurRepository utilisateurRepository; // 👈 On déclare le repository

    // 👈 On injecte le repository dans le constructeur avec le service
    public AuthController(AuthenticationService service, UtilisateurRepository utilisateurRepository) {
        this.service = service;
        this.utilisateurRepository = utilisateurRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthObjets.AuthenticationResponse> register(
            @RequestBody AuthObjets.RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthObjets.AuthenticationResponse> authenticate(
            @RequestBody AuthObjets.AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        // 1. On vérifie si l'utilisateur est bien connecté (grâce au JWT intercepté par Spring Security)
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
        }

        // 2. On récupère l'email extrait du Token
        String email = authentication.getName();

        // 3. On cherche l'utilisateur dans la base de données
        Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            // Le @JsonIgnore sur le mot de passe dans Utilisateur.java empêchera de l'envoyer
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable");
        }
    }
}