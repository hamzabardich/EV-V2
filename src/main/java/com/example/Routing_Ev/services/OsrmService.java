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

    // 💡 Astuce d'architecte : Un Record pour stocker proprement les 3 infos renvoyées par OSRM
    public record OsrmResult(String geometry, double distanceMetres, double dureeSecondes) {}

    // J'ai renommé la méthode pour que ce soit plus logique (elle ne renvoie plus juste la géométrie)
    public OsrmResult getRoute(double startLon, double startLat, double endLon, double endLat) {
        String url = String.format(
                "http://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson",
                startLon, startLat, endLon, endLat
        );

        try {
            // 1. On récupère la réponse JSON
            String response = restTemplate.getForObject(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response);

            // 2. On cible la première route proposée
            JsonNode routeNode = rootNode.path("routes").get(0);

            // 3. On extrait les 3 informations cruciales
            String geometry = routeNode.path("geometry").toString();
            double distance = routeNode.path("distance").asDouble(); // OSRM renvoie des mètres
            double duration = routeNode.path("duration").asDouble(); // OSRM renvoie des secondes

            // 4. On renvoie notre objet groupé
            return new OsrmResult(geometry, distance, duration);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors du traitement OSRM : " + e.getMessage());
            return null;
        }
    }
}