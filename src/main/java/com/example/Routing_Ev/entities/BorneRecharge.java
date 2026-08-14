package com.example.Routing_Ev.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point; // pour la cartographie !

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorneRecharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String typePrise;
    private double puissanceKw;

    // On force PostgreSQL à créer une colonne spatiale avec le système de coordonnées GPS standard (SRID 4326)
    @Column(columnDefinition = "geometry(Point,4326)")
    @JsonIgnore // Empêche Jackson de planter en essayant de lire l'objet complexe JTS
    private Point localisation;

    // --- Ajout pour corriger l'erreur 500 dans Postman ---

    // Jackson va automatiquement détecter ce "getter" et créer un champ "latitude" dans le JSON
    public Double getLatitude() {
        return localisation != null ? localisation.getY() : null;
    }

    // Jackson va automatiquement détecter ce "getter" et créer un champ "longitude" dans le JSON
    public Double getLongitude() {
        return localisation != null ? localisation.getX() : null;
    }
}