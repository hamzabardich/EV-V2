package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.entities.Vehicule;
import com.example.Routing_Ev.entities.Utilisateur;
import com.example.Routing_Ev.repositories.VehiculeRepository;
import com.example.Routing_Ev.repositories.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mes-vehicules")
@CrossOrigin(origins = "*")
public class MesVehiculesController {

    private final VehiculeRepository vehiculeRepository;
    private final UtilisateurRepository utilisateurRepository;

    public MesVehiculesController(VehiculeRepository vehiculeRepository, UtilisateurRepository utilisateurRepository) {
        this.vehiculeRepository = vehiculeRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // 1. VOIR SON GARAGE : Récupérer tous les véhicules de l'utilisateur connecté
    @GetMapping
    public ResponseEntity<?> getMesVehicules(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Non autorisé");

        List<Vehicule> mesVehicules = vehiculeRepository.findByUtilisateur_Email(principal.getName());
        return ResponseEntity.ok(mesVehicules);
    }

    // 2. AJOUTER UNE VOITURE : Créer un nouveau véhicule et le lier à l'utilisateur
    @PostMapping
    public ResponseEntity<?> ajouterVehicule(@RequestBody Vehicule nouveauVehicule, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Non autorisé");

        // On cherche le propriétaire dans la BDD grâce au token
        Optional<Utilisateur> proprietaire = utilisateurRepository.findByEmail(principal.getName());

        if (proprietaire.isPresent()) {
            nouveauVehicule.setUtilisateur(proprietaire.get()); // On lie la voiture à son propriétaire
            Vehicule vehiculeSauvegarde = vehiculeRepository.save(nouveauVehicule);
            return ResponseEntity.ok(vehiculeSauvegarde);
        }

        return ResponseEntity.badRequest().body("Utilisateur introuvable");
    }

    // 3. SUPPRIMER UNE VOITURE : On vérifie que la voiture appartient bien à la personne avant de la supprimer
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerVehicule(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Non autorisé");

        // On cherche la voiture qui a cet ID ET qui appartient à cet email
        Optional<Vehicule> vehiculeOpt = vehiculeRepository.findByIdAndUtilisateur_Email(id, principal.getName());

        if (vehiculeOpt.isPresent()) {
            vehiculeRepository.delete(vehiculeOpt.get());
            return ResponseEntity.ok("Véhicule supprimé avec succès !");
        } else {
            return ResponseEntity.status(403).body("Ce véhicule ne vous appartient pas ou n'existe pas.");
        }
    }
}