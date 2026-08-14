package com.example.Routing_Ev.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double startLatitude;
    private double startLongitude;
    private double endLatitude;
    private double endLongitude;

    private double distanceKm;
    private long dureeMinutes;

    private LocalDateTime dateCreation;

    // Association avec le véhicule choisi
    @ManyToOne
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    // Association avec les bornes trouvées sur ce trajet
    @ManyToMany
    @JoinTable(
            name = "trajet_bornes",
            joinColumns = @JoinColumn(name = "trajet_id"),
            inverseJoinColumns = @JoinColumn(name = "borne_id")
    )
    private List<BorneRecharge> bornesSuggerees;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }
}