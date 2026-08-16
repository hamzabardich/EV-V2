package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.repositories.TrajetRepository;
import com.example.Routing_Ev.repositories.UtilisateurRepository;
import com.example.Routing_Ev.repositories.VehiculeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UtilisateurRepository utilisateurRepository;
    private final TrajetRepository trajetRepository;
    private final VehiculeRepository vehiculeRepository;

    public AdminController(UtilisateurRepository utilisateurRepository,
                           TrajetRepository trajetRepository,
                           VehiculeRepository vehiculeRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.trajetRepository = trajetRepository;
        this.vehiculeRepository = vehiculeRepository;
    }

    // 1. Ta méthode existante (La liste des utilisateurs)
    @GetMapping("/utilisateurs")
    public ResponseEntity<?> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateurRepository.findAll());
    }

    // 2. NOUVELLE MÉTHODE : Les statistiques globales pour les graphiques
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Données de base
        long totalUsers = utilisateurRepository.count();
        long totalVehicules = vehiculeRepository.count();

        // 2. Analyse des trajets
        var tousLesTrajets = trajetRepository.findAll();
        long totalTrajets = tousLesTrajets.size();

        // Calcul de la distance totale cumulée
        double distanceTotale = tousLesTrajets.stream().mapToDouble(t -> t.getDistanceKm()).sum();

        // Catégorisation pour le nouveau graphique en barres
        long petitsTrajets = tousLesTrajets.stream().filter(t -> t.getDistanceKm() < 100).count();
        long moyensTrajets = tousLesTrajets.stream().filter(t -> t.getDistanceKm() >= 100 && t.getDistanceKm() <= 300).count();
        long longsTrajets = tousLesTrajets.stream().filter(t -> t.getDistanceKm() > 300).count();

        // 3. Analyse des rôles pour le graphique circulaire
        long adminCount = utilisateurRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .count();
        long userCount = totalUsers - adminCount;

        // 4. On met tout dans la réponse JSON
        stats.put("totalUsers", totalUsers);
        stats.put("totalTrajets", totalTrajets);
        stats.put("totalVehicules", totalVehicules);
        stats.put("distanceTotale", Math.round(distanceTotale));
        stats.put("petitsTrajets", petitsTrajets);
        stats.put("moyensTrajets", moyensTrajets);
        stats.put("longsTrajets", longsTrajets);
        stats.put("adminCount", adminCount);
        stats.put("userCount", userCount);

        return ResponseEntity.ok(stats);
    }
}