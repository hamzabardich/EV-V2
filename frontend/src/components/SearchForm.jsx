import { useState, useEffect } from 'react';
import AutocompleteInput from './AutocompleteInput';

const SearchForm = ({ onRouteCalculated }) => {
    const [vehicules, setVehicules] = useState([]);
    const [selectedVehicule, setSelectedVehicule] = useState("");
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isClimActive, setIsClimActive] = useState(false);
    const [chargeUtileKg, setChargeUtileKg] = useState(0);

    useEffect(() => {
        fetch('http://localhost:8080/api/vehicules')
            .then((response) => response.json())
            .then((data) => setVehicules(data))
            .catch((error) => console.error("Erreur:", error));
    }, []);

    const handleCalculer = async () => {
        if (!selectedVehicule || !startPoint || !endPoint) {
            alert("Veuillez remplir tous les champs principaux !");
            return;
        }

        setIsLoading(true);

        try {
            const url = `http://localhost:8080/api/routing/trajet?startLon=${startPoint.lon}&startLat=${startPoint.lat}&endLon=${endPoint.lon}&endLat=${endPoint.lat}&vehiculeId=${selectedVehicule}&isClimActive=${isClimActive}&chargeUtileKg=${chargeUtileKg}`;

            // On récupère le token s'il existe
            const token = localStorage.getItem('token');

            // On prépare les en-têtes (Headers) de la requête
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // On envoie la requête avec le token !
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            if (!response.ok) throw new Error("Erreur lors du calcul de l'itinéraire");

            const data = await response.json();

            // On envoie les données de la route ET les paramètres choisis (avec le endPoint en plus !)
            onRouteCalculated(data, {
                startPoint,
                endPoint,
                selectedVehicule,
                isClimActive,
                chargeUtileKg
            });

        } catch (error) {
            console.error("Erreur de routage:", error);
            alert("Impossible de calculer l'itinéraire.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Planificateur Intelligent (V3)</h2>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Véhicule électrique</label>
                <select
                    value={selectedVehicule}
                    onChange={(e) => setSelectedVehicule(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                >
                    <option value="">Sélectionnez un modèle...</option>
                    {vehicules.map((vehicule) => (
                        <option key={vehicule.id} value={vehicule.id}>
                            {vehicule.modele}
                        </option>
                    ))}
                </select>
            </div>

            <AutocompleteInput
                label="Point de départ"
                placeholder="Ex: Technopark, Casablanca..."
                onLocationSelect={(coords) => setStartPoint(coords)}
                showLocateButton={true}
            />

            <AutocompleteInput
                label="Point d'arrivée"
                placeholder="Ex: Gare de Tanger..."
                onLocationSelect={(coords) => setEndPoint(coords)}
            />

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-3">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Options de conduite</span>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={isClimActive}
                        onChange={(e) => setIsClimActive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    ❄️ Climatisation (-15% d'autonomie)
                </label>

                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Poids additionnel (Passagers + Bagages en kg)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="10"
                        value={chargeUtileKg}
                        onChange={(e) => setChargeUtileKg(e.target.value)}
                        placeholder="Ex: 150"
                        className="w-full border border-slate-300 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                </div>
            </div>

            <button
                onClick={handleCalculer}
                disabled={isLoading}
                className={`w-full font-semibold py-2 mt-2 rounded-lg transition duration-200 shadow-md flex justify-center items-center gap-2
                    ${isLoading
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
                {isLoading ? (
                    <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Calcul en cours...
                    </>
                ) : (
                    "Calculer le trajet"
                )}
            </button>
        </div>
    );
};

export default SearchForm;