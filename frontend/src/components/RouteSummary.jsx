const RouteSummary = ({ data }) => {
    if (!data) return null;

    const dureeMinutes = data["3_duree_minutes"];
    const heures = Math.floor(dureeMinutes / 60);
    const minutesRestantes = dureeMinutes % 60;
    const tempsAffichage = heures > 0
        ? `${heures}h ${minutesRestantes}min`
        : `${minutesRestantes} min`;

    const bornes = data["5_bornes_a_proximite"] || [];

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

                <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-2">⚡ Bornes trouvées</span>
                    <span className="font-bold text-blue-600">{data["4_nombre_bornes_trouvees"]}</span>
                </div>
            </div>

            {/* Liste détaillée des bornes avec un scroll */}
            {bornes.length > 0 && (
                <div className="mt-2">
                    <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Liste des stations</h4>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {bornes.map((borne, index) => (
                            <div key={index} className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm flex justify-between items-center hover:bg-slate-100 transition">
                                <div>
                                    <strong className="block text-slate-800">{borne.nom || `Station #${index + 1}`}</strong>
                                    <span className="text-xs text-slate-500">{borne.typeConnecteur || "Connecteur standard"}</span>
                                </div>
                                <div className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">
                                    {borne.puissanceKw ? `${borne.puissanceKw} kW` : "N/A"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteSummary;