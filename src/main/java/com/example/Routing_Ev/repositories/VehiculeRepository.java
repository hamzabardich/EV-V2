package com.example.Routing_Ev.repositories;

import com.example.Routing_Ev.entities.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {

    // Trouver tous les véhicules d'un utilisateur précis via son email
    List<Vehicule> findByUtilisateur_Email(String email);

    // Trouver un véhicule précis appartenant à un utilisateur précis (pour éviter qu'un utilisateur supprime la voiture d'un autre)
    Optional<Vehicule> findByIdAndUtilisateur_Email(Long id, String email);

    // 👇 NOUVELLE MÉTHODE : Trouver les véhicules qui n'ont pas de propriétaire
    List<Vehicule> findByUtilisateurIsNull();
}
