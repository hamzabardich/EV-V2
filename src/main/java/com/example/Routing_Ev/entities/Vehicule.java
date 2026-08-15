package com.example.Routing_Ev.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data // Lombok : Génère automatiquement les Getters, Setters, et toString()
@NoArgsConstructor
@AllArgsConstructor
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String marque;
    private String modele;
    private double capaciteBatterie; // en kWh
    private double autonomie; // en km

    // ... tes autres attributs existants (id, marque, autonomie, etc.)

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    // N'oublie pas de générer les Getters et Setters pour 'utilisateur' :
    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    // Constructeur par défaut (obligatoire pour Spring/JPA)


    // Le constructeur à 5 paramètres que ton code réclame :
    // (Adapte les types selon les vrais noms de tes attributs si besoin)
    public Vehicule(Long id, String marque, String modele, double autonomie, double capaciteBatterie) {
        this.id = id;
        this.marque = marque;
        this.modele = modele;
        this.autonomie = autonomie;
        this.capaciteBatterie = capaciteBatterie;
    }
}