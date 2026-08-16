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
                if (!response.ok) throw new Error("Erreur lors de la récupération du réseau.");
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

    // ✅ CORRECTION ICI : On utilise bien borne.puissanceKw au lieu de borne.puissance
    const filteredBornes = bornes.filter(borne => {
        if (puissanceMin === '') return true;
        return borne.puissanceKw && borne.puissanceKw >= Number(puissanceMin);
    });

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Réseau de Recharge 🔌</h1>
                    <p className="text-slate-500">Consultez l'ensemble des bornes de recharge disponibles au Maroc.</p>
                </div>
                <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition">
                    Retour à la carte
                </Link>
            </header>

            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 inline-flex items-center gap-4">
                <label className="font-bold text-slate-700 whitespace-nowrap">⚡ Afficher les bornes :</label>
                <select
                    value={puissanceMin}
                    onChange={(e) => setPuissanceMin(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="">Toutes les puissances</option>
                    <option value="22">Standard (≥ 22 kW)</option>
                    <option value="50">Rapide (≥ 50 kW)</option>
                    <option value="150">Ultra Rapide (≥ 150 kW)</option>
                </select>
            </div>

            {isLoading ? (
                <div className="text-center p-8 text-slate-600 font-semibold flex justify-center items-center gap-3">
                    <span className="animate-spin text-2xl">⏳</span> Chargement du réseau...
                </div>
            ) : erreur ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm font-bold">
                    {erreur}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">
                            Résultat : {filteredBornes.length} stations trouvées
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-800 text-white text-sm uppercase tracking-wider border-b border-slate-200">
                                {/* ✅ J'ai adapté les en-têtes pour qu'ils correspondent à ton entité */}
                                <th className="p-4 font-semibold">Station</th>
                                <th className="p-4 font-semibold">Détails Techniques</th>
                                <th className="p-4 font-semibold">Puissance (kW)</th>
                                <th className="p-4 font-semibold text-center">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredBornes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500 font-bold">
                                        Aucune borne ne correspond à cette puissance. 😥
                                    </td>
                                </tr>
                            ) : (
                                filteredBornes.map((borne) => (
                                    <tr key={borne.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <div className="font-extrabold text-slate-800 text-lg">
                                                {borne.nom || `Station #${borne.id}`}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {/* ✅ On affiche le type de prise et on a retiré la ville/adresse */}
                                            <div className="text-slate-800 font-medium">
                                                🔌 Prise : {borne.typePrise || 'Standard'}
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                📍 {borne.latitude?.toFixed(4)}, {borne.longitude?.toFixed(4)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {borne.puissanceKw ? (
                                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                                                        ⚡ {borne.puissanceKw} kW
                                                    </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm italic">Non spécifiée</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => ouvrirGoogleMaps(borne.latitude, borne.longitude)}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2 px-4 rounded-lg transition border border-blue-200 hover:border-blue-600 shadow-sm"
                                            >
                                                🗺️ Voir sur Maps
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogueBornes;