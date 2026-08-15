package com.example.Routing_Ev.security.auth;

import com.example.Routing_Ev.entities.Utilisateur;
import com.example.Routing_Ev.repositories.UtilisateurRepository;
import com.example.Routing_Ev.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UtilisateurRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UtilisateurRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // 1. Inscription
    public AuthObjets.AuthenticationResponse register(AuthObjets.RegisterRequest request) {
        // On vérifie si l'email existe déjà
        if (repository.existsByEmail(request.email())) {
            throw new RuntimeException("Cet email est déjà utilisé !");
        }

        // On crée le nouvel utilisateur
        Utilisateur user = new Utilisateur();
        user.setNom(request.nom());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password())); // 🔒 ON HACHE LE MOT DE PASSE !
        user.setRole("USER");

        // On le sauvegarde en BDD
        repository.save(user);

        // On génère son passeport (JWT)
        String jwtToken = jwtService.generateToken(user);
        return new AuthObjets.AuthenticationResponse(jwtToken);
    }

    // 2. Connexion
    public AuthObjets.AuthenticationResponse authenticate(AuthObjets.AuthenticationRequest request) {
        // Spring Security vérifie si l'email et le mot de passe correspondent
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // Si on arrive ici, c'est que le mot de passe est bon ! On récupère l'utilisateur.
        Utilisateur user = repository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // On lui génère un nouveau passeport
        String jwtToken = jwtService.generateToken(user);
        return new AuthObjets.AuthenticationResponse(jwtToken);
    }
}