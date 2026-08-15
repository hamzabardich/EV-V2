        package com.example.Routing_Ev.config;

        import org.springframework.beans.factory.annotation.Value;

        import com.example.Routing_Ev.entities.BorneRecharge;
        import com.example.Routing_Ev.entities.Vehicule;
        import com.example.Routing_Ev.repositories.BorneRechargeRepository;
        import com.example.Routing_Ev.repositories.VehiculeRepository;
        import com.fasterxml.jackson.databind.JsonNode;
        import com.fasterxml.jackson.databind.ObjectMapper;
        import org.locationtech.jts.geom.Coordinate;
        import org.locationtech.jts.geom.GeometryFactory;
        import org.locationtech.jts.geom.Point;
        import org.locationtech.jts.geom.PrecisionModel;
        import org.springframework.boot.CommandLineRunner;
        import org.springframework.context.annotation.Bean;
        import org.springframework.context.annotation.Configuration;
        import org.springframework.http.HttpEntity;
        import org.springframework.http.HttpHeaders;
        import org.springframework.http.HttpMethod;
        import org.springframework.http.ResponseEntity;
        import org.springframework.web.client.RestTemplate;

        import java.util.Arrays;
        import java.util.List;

        @Configuration
        public class DataInitializer {

            @Value("${openchargemap.api.key}")
            private String apiKey;

            @Bean
            public CommandLineRunner initDatabase(VehiculeRepository vehiculeRepo, BorneRechargeRepository borneRepo) {
                return args -> {

                    // --- PARTIE 1 : INJECTION DES VÉHICULES ---
                    if (vehiculeRepo.count() == 0) {
                        System.out.println("🚗 Injection du catalogue de véhicules...");

                        List<Vehicule> catalogueVehicules = Arrays.asList(
                                new Vehicule(null, "Dacia", "Spring", 26.8, 230.0),
                                new Vehicule(null, "Renault", "Zoe", 52.0, 395.0),
                                new Vehicule(null, "Renault", "Megane E-Tech", 60.0, 450.0),
                                new Vehicule(null, "Peugeot", "e-208", 50.0, 340.0),
                                new Vehicule(null, "Tesla", "Model 3 Propulsion", 60.0, 491.0),
                                new Vehicule(null, "Tesla", "Model 3 Grande Autonomie", 75.0, 602.0),
                                new Vehicule(null, "Tesla", "Model Y", 75.0, 505.0),
                                new Vehicule(null, "Hyundai", "Kona Electric", 64.0, 484.0),
                                new Vehicule(null, "Hyundai", "Ioniq 5", 77.4, 507.0),
                                new Vehicule(null, "Kia", "e-Niro", 64.0, 455.0),
                                new Vehicule(null, "Volkswagen", "ID.3", 58.0, 426.0),
                                new Vehicule(null, "Volkswagen", "ID.4", 77.0, 520.0),
                                new Vehicule(null, "Nissan", "Leaf", 40.0, 270.0),
                                new Vehicule(null, "MG", "MG4", 64.0, 450.0),
                                new Vehicule(null, "Fiat", "500e", 42.0, 320.0)
                        );

                        vehiculeRepo.saveAll(catalogueVehicules);
                        System.out.println("✅ Véhicules insérés avec succès dans la base ev_routing !");
                    }

                    // --- PARTIE 2 : TÉLÉCHARGEMENT DES BORNES DE RECHARGE ---
                    if (borneRepo.count() == 0) {
                        System.out.println("🌍 Téléchargement des bornes depuis OpenChargeMap...");

                        RestTemplate restTemplate = new RestTemplate();
                        HttpHeaders headers = new HttpHeaders();

                        // ⚠️ N'OUBLIE PAS DE METTRE TA CLÉ API ICI
                        headers.set("X-API-Key", apiKey);

                        HttpEntity<String> entity = new HttpEntity<>(headers);
                        String url = "https://api.openchargemap.io/v3/poi/?output=json&countrycode=MA&maxresults=1000";

                        try {
                            // On récupère la réponse sous forme de String brute pour éviter les erreurs de mapping direct
                            ResponseEntity<String> response = restTemplate.exchange(
                                    url, HttpMethod.GET, entity, String.class
                            );

                            String jsonBody = response.getBody();
                            if (jsonBody != null) {
                                ObjectMapper objectMapper = new ObjectMapper();
                                JsonNode rootNode = objectMapper.readTree(jsonBody);

                                GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

                                if (rootNode.isArray()) {
                                    for (JsonNode station : rootNode) {
                                        JsonNode addressInfo = station.path("AddressInfo");
                                        String nom = addressInfo.path("Title").asText("Borne Inconnue");
                                        double lat = addressInfo.path("Latitude").asDouble();
                                        double lng = addressInfo.path("Longitude").asDouble();

                                        double puissance = 22.0;
                                        String typePrise = "Standard";
                                        JsonNode connections = station.path("Connections");

                                        if (connections.isArray() && !connections.isEmpty()) {
                                            JsonNode firstConnection = connections.get(0);
                                            if (firstConnection.hasNonNull("PowerKW")) {
                                                puissance = firstConnection.path("PowerKW").asDouble();
                                            }
                                            typePrise = firstConnection.path("ConnectionType").path("Title").asText("Inconnu");
                                        }

                                        // Création du Point PostGIS (Longitude X, Latitude Y)
                                        Point localisation = geometryFactory.createPoint(new Coordinate(lng, lat));

                                        BorneRecharge borne = new BorneRecharge(null, nom, typePrise, puissance, localisation);
                                        borneRepo.save(borne);
                                    }
                                    System.out.println("✅ Bornes importées avec succès dans la base ev_routing !");
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("❌ Erreur API : Vérifie ta clé API ou ta connexion. Détails : " + e.getMessage());
                        }
                    }
                    else {System.out.println("les donnees sont deja la");
                    }
                };
            }
        }