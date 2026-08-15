package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.entities.Trajet;
import com.example.Routing_Ev.repositories.TrajetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trajets")
@CrossOrigin(origins = "*")
public class HistoriqueController {

    private final TrajetRepository trajetRepository;

    public HistoriqueController(TrajetRepository trajetRepository) {
        this.trajetRepository = trajetRepository;
    }

    @GetMapping("/historique")
    public ResponseEntity<?> getHistoriqueUtilisateur(Principal principal) {
        // 1. On vérifie que l'utilisateur est bien connecté
        if (principal == null) {
            return ResponseEntity.status(401).body("Accès refusé : Vous devez être connecté.");
        }

        // 2. On récupère son email depuis le token (géré par Spring Security)
        String email = principal.getName();

        // 3. On va chercher tous ses trajets dans la base de données
        List<Trajet> mesTrajets = trajetRepository.findByUtilisateur_EmailOrderByIdDesc(email);

        // 4. On renvoie la liste (qui sera vide si c'est son premier jour)
        return ResponseEntity.ok(mesTrajets);
    }
}