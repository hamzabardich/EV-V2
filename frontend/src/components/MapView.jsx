    import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
    import { useEffect } from 'react';
    import L from 'leaflet';

    // --- Création d'icônes personnalisées en HTML/CSS pur ---
    const startIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="font-size: 24px; line-height: 1; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.4));">🟢</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const endIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.4));">🏁</div>`,
        iconSize: [26, 26],
        iconAnchor: [6, 26] // Ancré au pied du drapeau
    });

    const stationIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="background: white; border: 2px solid #3b82f6; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); font-size: 14px;">⚡</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    // NOUVEAU V3 : Icône pour la borne recommandée par l'IA
    const recommendedIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="font-size: 34px; line-height: 1; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.6));">🎯</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    const MapUpdater = ({ geoJsonData }) => {
        const map = useMap();
        useEffect(() => {
            if (geoJsonData) {
                const layer = L.geoJSON(geoJsonData);
                const bounds = layer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }, [geoJsonData, map]);
        return null;
    };

    // Fonction pour extraire le premier et dernier point du tracé OSRM
    const getStartEndCoordinates = (geoJson) => {
        if (!geoJson || !geoJson.coordinates || geoJson.coordinates.length === 0) return { start: null, end: null };

        // OSRM renvoie [Longitude, Latitude], Leaflet utilise [Latitude, Longitude]
        let coords = geoJson.coordinates;
        if (geoJson.type === "MultiLineString") coords = coords[0]; // Sécurité au cas où

        const start = [coords[0][1], coords[0][0]];
        const last = coords[coords.length - 1];
        const end = [last[1], last[0]];

        return { start, end };
    };

    const MapView = ({ routeData }) => {
        const defaultPosition = [31.7917, -7.0926];

        // Extraction des points pour placer les icônes de départ et d'arrivée
        const routeGeom = routeData ? routeData["1_geometrie_trajet"] : null;
        const { start: startCoord, end: endCoord } = getStartEndCoordinates(routeGeom);

        // NOUVEAU V3 : Extraction de la borne recommandée
        const borneRecommandee = routeData ? routeData.borne_recommandee : null;

        return (
            <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-slate-200 z-0 relative">
                <MapContainer center={defaultPosition} zoom={6} className="w-full h-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {routeGeom && <MapUpdater geoJsonData={routeGeom} />}

                    {routeGeom && (
                        <GeoJSON
                            key={routeData.trajet_id}
                            data={routeGeom}
                            style={{ color: '#2563eb', weight: 6, opacity: 0.8 }}
                        />
                    )}

                    {/* Marqueur Départ */}
                    {startCoord && (
                        <Marker position={startCoord} icon={startIcon}>
                            <Popup><strong>Point de départ</strong></Popup>
                        </Marker>
                    )}

                    {/* Marqueur Arrivée */}
                    {endCoord && (
                        <Marker position={endCoord} icon={endIcon}>
                            <Popup><strong>Point d'arrivée</strong></Popup>
                        </Marker>
                    )}

                    {/* NOUVEAU V3 : Marqueur Borne Recommandée (Placé avec zIndexOffset pour passer au-dessus des autres) */}
                    {borneRecommandee && borneRecommandee.latitude && borneRecommandee.longitude && (
                        <Marker
                            position={[borneRecommandee.latitude, borneRecommandee.longitude]}
                            icon={recommendedIcon}
                            zIndexOffset={1000}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong className="block text-red-600 text-base mb-1">⚠️ Arrêt Recommandé (30%)</strong>
                                    <strong className="block text-slate-800">{borneRecommandee.nom || "Station idéale"}</strong>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded shadow-sm border border-green-200">
                                            ⚡ Puissance : {borneRecommandee.puissanceKw || "??"} kW
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Marqueurs Bornes Classiques */}
                    {routeData && routeData["5_bornes_a_proximite"] && routeData["5_bornes_a_proximite"].map((borne, index) => {
                        // Sécurité : On ne redessine pas la borne recommandée une 2ème fois en bleu
                        if (borneRecommandee && borne.id === borneRecommandee.id) return null;

                        return (
                            <Marker
                                key={`borne-${index}`}
                                position={[borne.latitude, borne.longitude]}
                                icon={stationIcon}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <strong className="block text-base mb-1 text-slate-800">{borne.nom || "Borne de recharge"}</strong>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                                ⚡ Puissance : {borne.puissanceKw || "??"} kW
                                            </span>
                                            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded">
                                                🔌 Type : {borne.typeConnecteur || "Standard"}
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        );
    };

    export default MapView;