package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.entities.BorneRecharge;
import com.example.Routing_Ev.entities.Trajet;
import com.example.Routing_Ev.entities.Vehicule;
import com.example.Routing_Ev.repositories.BorneRechargeRepository;
import com.example.Routing_Ev.repositories.TrajetRepository;
import com.example.Routing_Ev.repositories.VehiculeRepository;
import com.example.Routing_Ev.services.OsrmService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routing")
@CrossOrigin(origins = "*") // Autorise les appels depuis le futur frontend React
public class RoutingController {

    private final OsrmService osrmService;
    private final BorneRechargeRepository borneRepository;
    private final TrajetRepository trajetRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ObjectMapper objectMapper;

    public RoutingController(
            OsrmService osrmService,
            BorneRechargeRepository borneRepository,
            TrajetRepository trajetRepository,
            VehiculeRepository vehiculeRepository) {
        this.osrmService = osrmService;
        this.borneRepository = borneRepository;
        this.trajetRepository = trajetRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping("/trajet")
    public Map<String, Object> getTrajetEtBornes(
            @RequestParam double startLon, @RequestParam double startLat,
            @RequestParam double endLon, @RequestParam double endLat,
            @RequestParam(defaultValue = "5000") double rayonMetres,
            @RequestParam(required = false) Long vehiculeId) throws JsonProcessingException {

        // 1. Récupération de l'itinéraire OSRM
        OsrmService.OsrmResult osrmResult = osrmService.getRoute(startLon, startLat, endLon, endLat);

        if (osrmResult == null) {
            Map<String, Object> erreur = new HashMap<>();
            erreur.put("erreur", "Impossible de calculer l'itinéraire avec OSRM");
            return erreur;
        }

        // 2. Recherche spatiale des bornes via PostGIS
        List<BorneRecharge> bornesProches = borneRepository.findBornesAutourDuTrajet(osrmResult.geometry(), rayonMetres);

        // 3. Calculs d'affichage
        double distanceKm = Math.round((osrmResult.distanceMetres() / 1000) * 100.0) / 100.0;
        long dureeMinutes = Math.round(osrmResult.dureeSecondes() / 60.0);

        // 4. Sauvegarde de l'historique en base de données
        Trajet trajet = new Trajet();
        trajet.setStartLatitude(startLat);
        trajet.setStartLongitude(startLon);
        trajet.setEndLatitude(endLat);
        trajet.setEndLongitude(endLon);
        trajet.setDistanceKm(distanceKm);
        trajet.setDureeMinutes(dureeMinutes);
        trajet.setBornesSuggerees(bornesProches);

        if (vehiculeId != null) {
            vehiculeRepository.findById(vehiculeId).ifPresent(trajet::setVehicule);
        }

        Trajet trajetSauvegarde = trajetRepository.save(trajet);

        // 5. Réponse finale JSON
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> traceCartographique = objectMapper.readValue(osrmResult.geometry(), Map.class);

        response.put("trajet_id", trajetSauvegarde.getId());
        response.put("1_geometrie_trajet", traceCartographique);
        response.put("2_distance_km", distanceKm);
        response.put("3_duree_minutes", dureeMinutes);
        response.put("4_nombre_bornes_trouvees", bornesProches.size());
        response.put("5_bornes_a_proximite", bornesProches);

        return response;
    }
}