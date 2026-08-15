package com.example.Routing_Ev.repositories;

import com.example.Routing_Ev.entities.Trajet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrajetRepository extends JpaRepository<Trajet, Long> {

    List<Trajet> findByUtilisateur_EmailOrderByIdDesc(String email);
}