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

            // 1. Mise à jour du nom
            if (updates.containsKey("nom") && !updates.get("nom").trim().isEmpty()) {
                user.setNom(updates.get("nom"));
            }

            // 2. Mise à jour de l'email
            if (updates.containsKey("email") && !updates.get("email").trim().isEmpty()) {
                String nouvelEmail = updates.get("email");

                // Si l'email change, on vérifie qu'il n'est pas déjà pris par quelqu'un d'autre
                if (!nouvelEmail.equals(user.getEmail())) {
                    if (utilisateurRepository.findByEmail(nouvelEmail).isPresent()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cet email est déjà utilisé.");
                    }
                    user.setEmail(nouvelEmail);
                    needToRelogin = true; // Le Token JWT actuel contient l'ancien email, il faudra se reconnecter
                }
            }

            utilisateurRepository.save(user);

            // On renvoie l'utilisateur mis à jour, et un flag pour dire au frontend de déconnecter si l'email a changé
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("user", user);
            response.put("needToRelogin", needToRelogin);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable");
        }
    }
}