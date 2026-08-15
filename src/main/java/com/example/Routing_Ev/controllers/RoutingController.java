package com.example.Routing_Ev.controllers;

import com.example.Routing_Ev.entities.BorneRecharge;
import com.example.Routing_Ev.entities.Trajet;
import com.example.Routing_Ev.entities.Vehicule;
import com.example.Routing_Ev.repositories.BorneRechargeRepository;
import com.example.Routing_Ev.repositories.TrajetRepository;
import com.example.Routing_Ev.repositories.VehiculeRepository;
import com.example.Routing_Ev.services.OsrmService;
import com.example.Routing_Ev.services.SmartRoutingService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routing")
@CrossOrigin(origins = "*")
public class RoutingController {

    private final OsrmService osrmService;
    private final BorneRechargeRepository borneRepository;
    private final TrajetRepository trajetRepository;
    private final VehiculeRepository vehiculeRepository;
    private final SmartRoutingService smartRoutingService;
    private final ObjectMapper objectMapper;

    public RoutingController(
            OsrmService osrmService,
            BorneRechargeRepository borneRepository,
            TrajetRepository trajetRepository,
            VehiculeRepository vehiculeRepository,
            SmartRoutingService smartRoutingService) {
        this.osrmService = osrmService;
        this.borneRepository = borneRepository;
        this.trajetRepository = trajetRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.smartRoutingService = smartRoutingService;
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping("/trajet")
    public Map<String, Object> getTrajetEtBornes(
            @RequestParam double startLon, @RequestParam double startLat,
            @RequestParam double endLon, @RequestParam double endLat,
            @RequestParam(required = false) Double wpLon, // NOUVEAU: Longitude de la borne étape
            @RequestParam(required = false) Double wpLat, // NOUVEAU: Latitude de la borne étape
            @RequestParam(defaultValue = "5000") double rayonMetres,
            @RequestParam(required = false) Long vehiculeId,
            @RequestParam(defaultValue = "false") boolean isClimActive,
            @RequestParam(defaultValue = "0") double chargeUtileKg
    ) throws JsonProcessingException {

        // 1. Récupération de l'itinéraire OSRM (Choix entre 2 ou 3 points)
        OsrmService.OsrmResult osrmResult;

        if (wpLon != null && wpLat != null) {
            osrmResult = osrmService.getRouteAvecEtape(startLon, startLat, wpLon, wpLat, endLon, endLat);
        } else {
            osrmResult = osrmService.getRoute(startLon, startLat, endLon, endLat);
        }

        if (osrmResult == null) {
            Map<String, Object> erreur = new HashMap<>();
            erreur.put("erreur", "Impossible de calculer l'itinéraire avec OSRM");
            return erreur;
        }

        double distanceKm = Math.round((osrmResult.distanceMetres() / 1000) * 100.0) / 100.0;
        long dureeMinutes = Math.round(osrmResult.dureeSecondes() / 60.0);

        // 2. INTELLIGENCE V3 : Calcul de l'autonomie et du besoin de recharge
        double autonomieReelle = 0.0;
        double distanceMaxAvantRecharge = 0.0;
        boolean besoinRecharge = false;

        if (vehiculeId != null) {
            Vehicule vehicule = vehiculeRepository.findById(vehiculeId).orElse(null);
            if (vehicule != null) {
                autonomieReelle = smartRoutingService.calculerAutonomieReelle(vehicule, isClimActive, chargeUtileKg);
                distanceMaxAvantRecharge = smartRoutingService.calculerDistanceMaxAvantRecharge(autonomieReelle);
                besoinRecharge = smartRoutingService.necessiteRecharge(distanceKm, distanceMaxAvantRecharge);
            }
        }

        // 3. RECHERCHE SPATIALE DE LA BORNE IDÉALE
        Map<String, Object> traceCartographique = objectMapper.readValue(osrmResult.geometry(), Map.class);
        BorneRecharge borneIdeale = null;

        if (besoinRecharge) {
            @SuppressWarnings("unchecked")
            List<List<Double>> coordinates = (List<List<Double>>) traceCartographique.get("coordinates");
            double[] pointPanne = smartRoutingService.trouverPointRechargeOptimal(coordinates, distanceMaxAvantRecharge);
            borneIdeale = borneRepository.findBorneIdealePourRecharge(pointPanne[0], pointPanne[1]);
        }

        // 4. Recherche globale classique
        List<BorneRecharge> bornesProches = borneRepository.findBornesAutourDuTrajet(osrmResult.geometry(), rayonMetres);

        // 5. Sauvegarde du trajet
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

        // 6. Construction de la réponse JSON finale
        Map<String, Object> response = new HashMap<>();
        response.put("trajet_id", trajetSauvegarde.getId());
        response.put("1_geometrie_trajet", traceCartographique);
        response.put("2_distance_km", distanceKm);
        response.put("3_duree_minutes", dureeMinutes);
        response.put("autonomie_reelle_km", autonomieReelle);
        response.put("seuil_alerte_recharge_km", distanceMaxAvantRecharge);
        response.put("necessite_recharge", besoinRecharge);
        response.put("borne_recommandee", borneIdeale);
        response.put("4_nombre_bornes_trouvees", bornesProches.size());
        response.put("5_bornes_a_proximite", bornesProches);

        return response;
    }
}