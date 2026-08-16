import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CatalogueVehicules = () => {
    const [vehicules, setVehicules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    // NOUVEAU : State pour la barre de recherche
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVehicules = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/vehicules');
                if (!response.ok) throw new Error("Erreur lors de la récupération des véhicules.");
                setVehicules(await response.json());
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVehicules();
    }, []);

    // NOUVEAU : On filtre la liste avant de l'afficher
    const filteredVehicules = vehicules.filter(v =>
        `${v.marque} ${v.modele}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Modèles Standard 🚗</h1>
                    <p className="text-slate-500">Découvrez les véhicules électriques pris en charge par notre plateforme.</p>
                </div>
                <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition">
                    Retour à la carte
                </Link>
            </header>

            {/* NOUVEAU : La barre de recherche */}
            <div className="mb-6 max-w-xl">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xl">🔍</span>
                    <input
                        type="text"
                        placeholder="Rechercher une marque ou un modèle (ex: Tesla, Dacia...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 p-3 bg-white border border-slate-300 rounded-xl text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center p-8 text-slate-600 font-semibold">Chargement des véhicules...</div>
            ) : erreur ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">{erreur}</div>
            ) : (
                <>
                    {filteredVehicules.length === 0 && (
                        <div className="text-center p-8 text-slate-500 font-bold bg-white rounded-xl border border-slate-200">
                            Aucun véhicule ne correspond à votre recherche "{searchTerm}"
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicules.map((v) => (
                            <div key={v.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{v.marque} {v.modele}</h2>
                                <div className="flex flex-col gap-2 mt-4 text-slate-600">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-semibold">🔋 Batterie :</span>
                                        <span>{v.capaciteBatterie || v.capacite_batterie} kWh</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-semibold">🛣️ Autonomie Max :</span>
                                        <span>{v.autonomie} km</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CatalogueVehicules;