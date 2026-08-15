package com.example.Routing_Ev.repositories;

import com.example.Routing_Ev.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    // Spring Data JPA va automatiquement écrire la requête SQL pour trouver un user par son email !
    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);
}