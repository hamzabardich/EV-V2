import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CatalogueBornes = () => {
    const [bornes, setBornes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        const fetchBornes = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/bornes');
                if (!response.ok) throw new Error("Erreur lors de la récupération du réseau.");

                const data = await response.json();
                setBornes(data);
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBornes();
    }, []);

    // Fonction pour ouvrir Google Maps avec les coordonnées exactes
    const ouvrirGoogleMaps = (lat, lon) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
    };

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
                        <h2 className="text-xl font-bold text-slate-800">Total : {bornes.length} stations actives</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-800 text-white text-sm uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 font-semibold">Station & Opérateur</th>
                                <th className="p-4 font-semibold">Localisation Exacte</th>
                                <th className="p-4 font-semibold">Puissance (kW)</th>
                                <th className="p-4 font-semibold text-center">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bornes.map((borne) => (
                                <tr key={borne.id} className="border-b border-slate-100 hover:bg-slate-50 transition">

                                    {/* Colonne 1 : Nom et Opérateur */}
                                    <td className="p-4">
                                        <div className="font-extrabold text-slate-800 text-lg">
                                            {borne.nom || `Station #${borne.id}`}
                                        </div>
                                        <div className="text-sm font-semibold text-indigo-600">
                                            {borne.operateur || 'Opérateur Standard'}
                                        </div>
                                    </td>

                                    {/* Colonne 2 : L'adresse lisible par un humain */}
                                    <td className="p-4">
                                        <div className="text-slate-800 font-medium">
                                            {borne.adresse || 'Aire de service / Autoroute'}
                                        </div>
                                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                            📍 {borne.ville || 'Maroc'}
                                        </div>
                                    </td>

                                    {/* Colonne 3 : Les détails techniques */}
                                    <td className="p-4">
                                        {borne.puissanceKw ? (
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                                                    ⚡ {borne.puissanceKw} kW
                                                </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">Non spécifiée</span>
                                        )}
                                    </td>

                                    {/* Colonne 4 : Le bouton Google Maps */}
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => ouvrirGoogleMaps(borne.latitude, borne.longitude)}
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2 px-4 rounded-lg transition border border-blue-200 hover:border-blue-600 shadow-sm"
                                        >
                                            🗺️ Voir sur Maps
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogueBornes;