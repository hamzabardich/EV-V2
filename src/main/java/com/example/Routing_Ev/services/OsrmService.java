package com.example.Routing_Ev.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OsrmService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OsrmService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public record OsrmResult(String geometry, double distanceMetres, double dureeSecondes) {}

    // Méthode classique à 2 points (Départ -> Arrivée)
    public OsrmResult getRoute(double startLon, double startLat, double endLon, double endLat) {
        // 👇 AJOUT DE continue_straight=true POUR PLUS DE FLUIDITÉ
        String url = String.format(java.util.Locale.US,
                "http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson&continue_straight=true",
                startLon, startLat, endLon, endLat
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode routeNode = rootNode.path("routes").get(0);

            String geometry = routeNode.path("geometry").toString();
            double distance = routeNode.path("distance").asDouble();
            double duration = routeNode.path("duration").asDouble();

            return new OsrmResult(geometry, distance, duration);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors du traitement OSRM : " + e.getMessage());
            return null;
        }
    }

    // NOUVELLE MÉTHODE V3 : Trajet à 3 points (Départ -> Borne -> Arrivée)
    public OsrmResult getRouteAvecEtape(double startLon, double startLat, double wpLon, double wpLat, double endLon, double endLat) {
        // 👇 AJOUT DE continue_straight=true POUR ÉVITER LES DEMI-TOURS FANTÔMES AUX BORNES !
        String url = String.format(java.util.Locale.US,
                "http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f;%f,%f?overview=full&geometries=geojson&continue_straight=true",
                startLon, startLat, wpLon, wpLat, endLon, endLat
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode routeNode = rootNode.path("routes").get(0);

            String geometry = routeNode.path("geometry").toString();
            double distance = routeNode.path("distance").asDouble();
            double duration = routeNode.path("duration").asDouble();

            return new OsrmResult(geometry, distance, duration);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors du traitement OSRM Multi-étapes : " + e.getMessage());
            return null;
        }
    }
}