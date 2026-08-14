package com.example.Routing_Ev;

import com.example.Routing_Ev.entities.Vehicule;
import com.example.Routing_Ev.services.SmartRoutingService;
import org.junit.jupiter.api.Test;

public class TestConsoleV3 {

    @Test
    void afficherResultatsSmartRouting() {
        SmartRoutingService service = new SmartRoutingService();

        // Simulation d'un véhicule ayant 400 km d'autonomie de base
        Vehicule maVoiture = new Vehicule();
        maVoiture.setAutonomie(400);

        // Test 1 : Sans clim, sans poids
        double auto1 = service.calculerAutonomieReelle(maVoiture, false, 0);
        double max1 = service.calculerDistanceMaxAvantRecharge(auto1);

        // Test 2 : Avec Clim active et 150 kg de bagages/passagers
        double auto2 = service.calculerAutonomieReelle(maVoiture, true, 150);
        double max2 = service.calculerDistanceMaxAvantRecharge(auto2);
        boolean besoinRecharge = service.necessiteRecharge(300.0, max2); // Trajet de 300 km

        System.out.println("==========================================");
        System.out.println("TEST 1 (Normal) -> Autonomie : " + auto1 + " km | Max avant recharge (70%) : " + max1 + " km");
        System.out.println("TEST 2 (Clim + 150kg) -> Autonomie réelle : " + auto2 + " km");
        System.out.println("TEST 2 -> Seuil alerte 30% : " + max2 + " km");
        System.out.println("TEST 2 -> Pour un trajet de 300 km, besoin de recharger ? " + besoinRecharge);
        System.out.println("==========================================");
    }
}