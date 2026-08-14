package com.example.Routing_Ev.services;

import com.example.Routing_Ev.entities.Vehicule;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SmartRoutingService {

    // Seuil de sécurité : On ne veut jamais descendre sous 30% de batterie
    private static final double SEUIL_SECURITE_BATTERIE = 0.30;

    // Pénalité de la climatisation : -15% d'autonomie
    private static final double PENALITE_CLIMATISATION = 0.15;

    // Pénalité du poids : -2% d'autonomie par tranche de 100 kg
    private static final double PENALITE_POIDS_POUR_100KG = 0.02;

    /**
     * 1. Calcule l'autonomie réelle du véhicule en fonction des conditions.
     */
    public double calculerAutonomieReelle(Vehicule vehicule, boolean isClimActive, double chargeUtileKg) {
        if (vehicule == null) {
            return 0.0;
        }

        double autonomieDeBase = vehicule.getAutonomie();
        double coefficientReduction = 0.0;

        if (isClimActive) {
            coefficientReduction += PENALITE_CLIMATISATION;
        }

        if (chargeUtileKg > 0) {
            double tranchesDe100Kg = chargeUtileKg / 100.0;
            coefficientReduction += (tranchesDe100Kg * PENALITE_POIDS_POUR_100KG);
        }

        if (coefficientReduction > 0.80) {
            coefficientReduction = 0.80;
        }

        double autonomieReelle = autonomieDeBase * (1.0 - coefficientReduction);
        return Math.round(autonomieReelle * 100.0) / 100.0;
    }

    /**
     * 2. Calcule la distance maximale qu'on s'autorise à rouler avant de s'arrêter
     */
    public double calculerDistanceMaxAvantRecharge(double autonomieReelle) {
        double distanceMax = autonomieReelle * (1.0 - SEUIL_SECURITE_BATTERIE);
        return Math.round(distanceMax * 100.0) / 100.0;
    }

    /**
     * 3. Détermine si le trajet nécessite au moins une recharge
     */
    public boolean necessiteRecharge(double distanceTrajetKm, double distanceMaxAvantRecharge) {
        return distanceTrajetKm > distanceMaxAvantRecharge;
    }

    /**
     * 4. Calcule la distance en kilomètres entre deux coordonnées GPS (Formule de Haversine)
     */
    private double calculerDistanceHaversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Rayon de la Terre en km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * 5. Parcourt la ligne OSRM pour trouver le point exact où la batterie arrive à son seuil
     */
    public double[] trouverPointRechargeOptimal(List<List<Double>> coordinates, double distanceMaxKm) {
        double distanceParcourue = 0.0;

        for (int i = 0; i < coordinates.size() - 1; i++) {
            List<Double> p1 = coordinates.get(i);
            List<Double> p2 = coordinates.get(i + 1);

            double lon1 = p1.get(0);
            double lat1 = p1.get(1);
            double lon2 = p2.get(0);
            double lat2 = p2.get(1);

            double segmentDist = calculerDistanceHaversine(lat1, lon1, lat2, lon2);

            if (distanceParcourue + segmentDist >= distanceMaxKm) {
                return new double[]{lon1, lat1};
            }

            distanceParcourue += segmentDist;
        }

        List<Double> dernierPoint = coordinates.get(coordinates.size() - 1);
        return new double[]{dernierPoint.get(0), dernierPoint.get(1)};
    }
}