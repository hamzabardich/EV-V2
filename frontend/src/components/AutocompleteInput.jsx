import { useState } from 'react';

const AutocompleteInput = ({ label, placeholder, onLocationSelect, showLocateButton }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLocating, setIsLocating] = useState(false); // État pour le chargement

    const handleSearch = async (text) => {
        setQuery(text);
        if (text.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`https://photon.komoot.io/api/?q=${text}&lat=31.7917&lon=-7.0926&limit=5`);
            const data = await response.json();
            setSuggestions(data.features);
        } catch (error) {
            console.error("Erreur Photon:", error);
        }
    };

    const handleSelect = (feature) => {
        const nomLieu = feature.properties.name;
        const ville = feature.properties.city ? `(${feature.properties.city})` : '';
        const [lon, lat] = feature.geometry.coordinates;

        setQuery(`${nomLieu} ${ville}`);
        setSuggestions([]);
        onLocationSelect({ lat, lon, nom: nomLieu });
    };

    // Nouvelle fonction pour la géolocalisation
    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            alert("Votre navigateur ne supporte pas la géolocalisation.");
            return;
        }

        setIsLocating(true);

        // Demande au navigateur la position de l'utilisateur
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse geocoding : on demande à Photon le nom du lieu à partir des coordonnées
                    const response = await fetch(`https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    let nomLieu = "Position actuelle";
                    if (data.features && data.features.length > 0) {
                        const props = data.features[0].properties;
                        // On essaie de récupérer le nom de la rue, du quartier ou de la ville
                        nomLieu = props.name || props.street || props.city || "Position actuelle";
                        if (props.city && nomLieu !== props.city) {
                            nomLieu += ` (${props.city})`;
                        }
                    }

                    setQuery(nomLieu); // On affiche le nom trouvé dans le champ
                    setSuggestions([]);
                    onLocationSelect({ lat: latitude, lon: longitude, nom: nomLieu }); // On envoie les coordonnées au formulaire
                } catch (error) {
                    console.error("Erreur de Reverse Geocoding:", error);
                    setQuery("Coordonnées GPS trouvées");
                    onLocationSelect({ lat: latitude, lon: longitude, nom: "Position GPS" });
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error("Erreur de géolocalisation:", error);
                alert("Impossible d'accéder à votre position. Veuillez autoriser la localisation.");
                setIsLocating(false);
            }
        );
    };

    return (
        <div className="relative">
            {/* En-tête avec le Label et le bouton de Géolocalisation */}
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">{label}</label>

                {showLocateButton && (
                    <button
                        type="button" // Important pour ne pas soumettre le formulaire
                        onClick={handleGeolocate}
                        disabled={isLocating}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center transition"
                    >
                        {isLocating ? "⏳ Localisation..." : "📍 Utiliser ma position"}
                    </button>
                )}
            </div>

            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            />

            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(suggestion)}
                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0"
                        >
                            <span className="font-semibold">{suggestion.properties.name}</span>
                            {suggestion.properties.city && <span className="text-slate-500 ml-1">- {suggestion.properties.city}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;