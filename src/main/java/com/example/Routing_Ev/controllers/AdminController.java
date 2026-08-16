package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.entities.Vehicule;
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

    // ==========================================
    // 📊 LECTURE DES DONNÉES ET STATISTIQUES
    // ==========================================

    @GetMapping("/utilisateurs")
    public ResponseEntity<?> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateurRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = utilisateurRepository.count();
        long totalVehicules = vehiculeRepository.count();

        var tousLesTrajets = trajetRepository.findAll();
        long totalTrajets = tousLesTrajets.size();

        double distanceTotale = tousLesTrajets.stream().mapToDouble(t -> t.getDistanceKm()).sum();

        long petitsTrajets = tousLesTrajets.stream().filter(t -> t.getDistanceKm() < 100).count();
        long moyensTrajets = tousLesTrajets.stream().filter(t -> t.getDistanceKm() >= 100 && t.getDistanceKm() <= 300).count();
        long longsTrajets = tousLesTrajets.stream().filter(t -> t.getDistanceKm() > 300).count();

        long adminCount = utilisateurRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .count();
        long userCount = totalUsers - adminCount;

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

    // ==========================================
    // 👑 MODE GOD : GESTION DES UTILISATEURS
    // ==========================================

    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<?> deleteUtilisateur(@PathVariable Long id) {
        try {
            return utilisateurRepository.findById(id).map(user -> {
                // 1. NETTOYAGE : Supprimer tous les trajets de cet utilisateur
                var tousLesTrajets = trajetRepository.findAll();
                for (var t : tousLesTrajets) {
                    if (t.getUtilisateur() != null && t.getUtilisateur().getId().equals(id)) {
                        trajetRepository.delete(t);
                    }
                }

                // 2. NETTOYAGE : Supprimer tous les véhicules personnels de cet utilisateur
                var tousLesVehicules = vehiculeRepository.findAll();
                for (var v : tousLesVehicules) {
                    if (v.getUtilisateur() != null && v.getUtilisateur().getId().equals(id)) {
                        vehiculeRepository.delete(v);
                    }
                }

                // 3. FIN : Maintenant on peut supprimer l'utilisateur sans erreur SQL !
                utilisateurRepository.deleteById(id);
                return ResponseEntity.ok().body("{\"message\": \"Utilisateur supprimé avec succès\"}");

            }).orElse(ResponseEntity.status(404).body("{\"erreur\": \"Utilisateur introuvable.\"}"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"erreur\": \"Erreur fatale lors de la suppression.\"}");
        }
    }

    // ==========================================
    // 🚗 MODE GOD : GESTION DU CATALOGUE VÉHICULES
    // ==========================================

    @PostMapping("/vehicules")
    public ResponseEntity<?> addVehiculePublic(@RequestBody Vehicule vehicule) {
        vehicule.setUtilisateur(null);
        return ResponseEntity.ok(vehiculeRepository.save(vehicule));
    }

    @PutMapping("/vehicules/{id}")
    public ResponseEntity<?> updateVehiculePublic(@PathVariable Long id, @RequestBody Vehicule details) {
        return vehiculeRepository.findById(id).map(vehicule -> {
            vehicule.setMarque(details.getMarque());
            vehicule.setModele(details.getModele());
            vehicule.setCapaciteBatterie(details.getCapaciteBatterie());
            vehicule.setAutonomie(details.getAutonomie());

            return ResponseEntity.ok(vehiculeRepository.save(vehicule));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/vehicules/{id}")
    public ResponseEntity<?> deleteVehiculePublic(@PathVariable Long id) {
        try {
            return vehiculeRepository.findById(id).map(vehicule -> {
                // 1. NETTOYAGE : Détacher ce véhicule des trajets existants pour éviter l'erreur SQL
                var tousLesTrajets = trajetRepository.findAll();
                for (var t : tousLesTrajets) {
                    if (t.getVehicule() != null && t.getVehicule().getId().equals(id)) {
                        t.setVehicule(null); // Le trajet existe toujours, mais on "efface" la trace de la voiture
                        trajetRepository.save(t);
                    }
                }

                // 2. FIN : On peut maintenant supprimer la voiture sereinement
                vehiculeRepository.deleteById(id);
                return ResponseEntity.ok().body("{\"message\": \"Véhicule supprimé du catalogue\"}");

            }).orElse(ResponseEntity.status(404).body("{\"erreur\": \"Véhicule introuvable.\"}"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"erreur\": \"Erreur fatale lors de la suppression.\"}");
        }
    }
}