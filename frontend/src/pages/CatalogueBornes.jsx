import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CatalogueBornes = () => {
    const [bornes, setBornes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const [puissanceMin, setPuissanceMin] = useState('');

    useEffect(() => {
        const fetchBornes = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/bornes');
                if (!response.ok) throw new Error("Erreur de récupération des bornes.");
                setBornes(await response.json());
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBornes();
    }, []);

    const ouvrirGoogleMaps = (lat, lon) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
    };

    const filteredBornes = bornes.filter(borne => {
        if (puissanceMin === '') return true;
        return borne.puissanceKw && borne.puissanceKw >= Number(puissanceMin);
    });

    const renderBadge = (kw) => {
        if (!kw) return <span className="text-slate-500 bg-slate-100 px-3 py-1 rounded-md text-xs font-bold">N/A</span>;
        if (kw >= 150) return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-xs font-bold border border-purple-200">⚡ Ultra ({kw}kW)</span>;
        if (kw >= 50) return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold border border-emerald-200">⚡ Rapide ({kw}kW)</span>;
        return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold border border-blue-200">⚡ Standard ({kw}kW)</span>;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">

            {/* HEADER SIMPLIFIÉ */}
            <div className="bg-white border-b border-slate-200 pt-10 pb-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 transition-colors">
                            <span>←</span> Retour à la carte
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Réseau de Recharge</h1>
                            <p className="text-slate-500 text-lg">Trouvez la station idéale pour votre véhicule.</p>
                        </div>

                        <div className="flex flex-col gap-1 w-full md:w-64">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Puissance minimale</label>
                            <select
                                value={puissanceMin} onChange={(e) => setPuissanceMin(e.target.value)}
                                className="p-3 w-full bg-slate-100 border-none rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                                <option value="">Toutes les puissances</option>
                                <option value="22">Standard (≥ 22 kW)</option>
                                <option value="50">Rapide (≥ 50 kW)</option>
                                <option value="150">Ultra Rapide (≥ 150 kW)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRILLE DES BORNES */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
                {isLoading ? (
                    <div className="text-center p-12 text-slate-500 font-semibold">Recherche des stations...</div>
                ) : erreur ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl font-medium">{erreur}</div>
                ) : (
                    <>
                        {filteredBornes.length === 0 ? (
                            <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 text-slate-500 font-medium">
                                Aucune station ne correspond à ce critère.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredBornes.map((borne) => (
                                    <div key={borne.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <h2 className="font-bold text-lg text-slate-800 leading-tight pr-2">
                                                    {borne.nom || `Station #${borne.id}`}
                                                </h2>
                                                {renderBadge(borne.puissanceKw)}
                                            </div>

                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="bg-slate-100 p-1.5 rounded-md text-base">🔌</span>
                                                    <span className="font-medium">Connecteur : {borne.typePrise || 'Standard'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="bg-slate-100 p-1.5 rounded-md text-base">📍</span>
                                                    <span className="font-mono text-xs">{borne.latitude?.toFixed(4)}, {borne.longitude?.toFixed(4)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => ouvrirGoogleMaps(borne.latitude, borne.longitude)}
                                            className="w-full bg-slate-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors border border-slate-200 hover:border-transparent flex justify-center items-center gap-2"
                                        >
                                            🗺️ Ouvrir dans Google Maps
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CatalogueBornes;