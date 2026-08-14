import { useState, useEffect } from 'react';
import AutocompleteInput from './AutocompleteInput';

const SearchForm = ({ onRouteCalculated }) => {
    const [vehicules, setVehicules] = useState([]);
    const [selectedVehicule, setSelectedVehicule] = useState("");
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);

    // Nouvel état pour gérer l'animation de chargement
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8080/api/vehicules')
            .then((response) => response.json())
            .then((data) => setVehicules(data))
            .catch((error) => console.error("Erreur:", error));
    }, []);

    const handleCalculer = async () => {
        if (!selectedVehicule || !startPoint || !endPoint) {
            alert("Veuillez remplir tous les champs !");
            return;
        }

        setIsLoading(true); // Début de l'animation

        try {
            const url = `http://localhost:8080/api/routing/trajet?startLon=${startPoint.lon}&startLat=${startPoint.lat}&endLon=${endPoint.lon}&endLat=${endPoint.lat}&vehiculeId=${selectedVehicule}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Erreur lors du calcul de l'itinéraire");

            const data = await response.json();
            onRouteCalculated(data);

        } catch (error) {
            console.error("Erreur de routage:", error);
            alert("Impossible de calculer l'itinéraire.");
        } finally {
            setIsLoading(false); // Fin de l'animation
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Paramètres du trajet</h2>

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
                    "Calculer l'itinéraire"
                )}
            </button>
        </div>
    );
};

export default SearchForm;