// On récupère la fonction onNavigateToBorne passée par App.jsx
const RouteSummary = ({ data, onNavigateToBorne }) => {
    if (!data) return null;

    const dureeMinutes = data["3_duree_minutes"];
    const heures = Math.floor(dureeMinutes / 60);
    const minutesRestantes = dureeMinutes % 60;
    const tempsAffichage = heures > 0
        ? `${heures}h ${minutesRestantes}min`
        : `${minutesRestantes} min`;

    const bornes = data["5_bornes_a_proximite"] || [];
    const borneRecommandee = data.borne_recommandee;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mt-6 flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">
                Résumé du trajet
            </h3>

            <div className="flex flex-col gap-3 mb-2">
                <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-2">🛣️ Distance</span>
                    <span className="font-semibold text-slate-900">{data["2_distance_km"]} km</span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-2">⏱️ Durée estimée</span>
                    <span className="font-semibold text-slate-900">{tempsAffichage}</span>
                </div>

                {data.autonomie_reelle_km && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">🔋 Autonomie réelle :</span>
                            <span className="font-bold text-indigo-600">{data.autonomie_reelle_km} km</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">🛡️ Seuil de sécurité (30%) :</span>
                            <span className="font-bold text-amber-600">{data.seuil_alerte_recharge_km} km</span>
                        </div>
                    </div>
                )}

                {data.necessite_recharge && borneRecommandee ? (
                    <div className="mt-2 border-2 border-red-300 bg-red-50 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                            <span>⚠️ ARRÊT RECHARGE OBLIGATOIRE</span>
                        </div>
                        <p className="text-xs text-red-600 mb-3">
                            L'IA a calculé que vous passerez sous les 30% de batterie. Voici la meilleure station sur votre route :
                        </p>

                        <div className="bg-white p-3 rounded border border-red-200 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <strong className="block text-slate-800 text-sm">🎯 {borneRecommandee.nom || "Station Recommandée"}</strong>
                                    <span className="text-xs text-slate-500">{borneRecommandee.typeConnecteur || "Standard"}</span>
                                </div>
                                <div className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded text-sm shadow-sm">
                                    {borneRecommandee.puissanceKw ? `${borneRecommandee.puissanceKw} kW` : "N/A"}
                                </div>
                            </div>

                            {/* --- MODIFICATION ICI : On utilise un vrai bouton React --- */}
                            <button
                                onClick={() => onNavigateToBorne(borneRecommandee)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded text-center transition flex justify-center items-center gap-2 shadow-sm mt-1 cursor-pointer"
                            >
                                📍 Naviguer vers cette borne sur la carte
                            </button>
                            {/* --------------------------------------------------------- */}
                        </div>

                    </div>
                ) : data.autonomie_reelle_km ? (
                    <div className="mt-2 p-3 rounded-lg text-sm font-bold text-center bg-green-100 text-green-800 border border-green-200">
                        ✅ Trajet réalisable sans recharge !
                    </div>
                ) : null}

                <div className="flex justify-between items-center text-slate-700 border-t pt-3 mt-2">
                    <span className="flex items-center gap-2">⚡ Autres bornes à proximité</span>
                    <span className="font-bold text-blue-600">{data["4_nombre_bornes_trouvees"]}</span>
                </div>
            </div>

            {bornes.length > 0 && (
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar mt-1">
                    {bornes.map((borne, index) => (
                        borne.id !== borneRecommandee?.id && (
                            <div key={index} className="bg-white border border-slate-200 p-2 rounded-lg text-xs flex justify-between items-center hover:border-blue-300 transition">
                                <div>
                                    <strong className="block text-slate-700">{borne.nom || `Station #${index + 1}`}</strong>
                                </div>
                                <div className="bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded">
                                    {borne.puissanceKw ? `${borne.puissanceKw} kW` : "-"}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default RouteSummary;