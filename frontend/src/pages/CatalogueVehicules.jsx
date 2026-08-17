import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CatalogueVehicules = () => {
    const [vehicules, setVehicules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
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

    const filteredVehicules = vehicules.filter(v =>
        `${v.marque} ${v.modele}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-12">
            {/* 🎨 HALOS LUMINEUX FINYOURWAY */}
            <div className="absolute top-[5%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>

            {/* 🌟 HEADER FINYOURWAY */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm mb-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-800 hidden sm:block">
                            FindYour<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Way</span>
                        </span>
                    </Link>
                    <Link to="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                        <span>←</span> <span className="hidden sm:inline">Retour carte</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 mb-2">Modèles Standard 🚗</h1>
                    <p className="text-slate-500 font-medium text-lg">Découvrez tous les véhicules électriques pris en charge par l'IA.</p>
                </div>

                <div className="mb-10 max-w-xl mx-auto md:mx-0">
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">🔍</span>
                        <input
                            type="text"
                            placeholder="Rechercher une marque ou un modèle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 p-4 bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium placeholder-slate-400"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Chargement des modèles...</div>
                ) : erreur ? (
                    <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-600 p-6 rounded-2xl font-medium">{erreur}</div>
                ) : (
                    <>
                        {filteredVehicules.length === 0 && (
                            <div className="bg-white/60 backdrop-blur-md p-12 rounded-[2rem] border border-dashed border-slate-300 text-center flex flex-col items-center justify-center min-h-[250px]">
                                <span className="text-5xl mb-4 opacity-50">🔍</span>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun résultat</h3>
                                <p className="text-slate-500">Aucun véhicule ne correspond à "{searchTerm}".</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredVehicules.map((v) => (
                                <div key={v.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10 group flex flex-col justify-between">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">{v.marque}</h2>
                                        <h3 className="text-lg font-bold text-slate-500">{v.modele}</h3>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:border-blue-100/50 transition-colors">
                                            <span className="font-semibold text-slate-500 text-sm">🔋 Batterie</span>
                                            {/* ⚠️ CORRECTION : Prise en charge des deux syntaxes pour éviter le bug */}
                                            <span className="font-black text-slate-700">{v.capaciteBatterie || v.capacite_batterie || v.capaciteBatterieKwh} kWh</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 group-hover:bg-blue-50 transition-colors">
                                            <span className="font-semibold text-blue-600 text-sm">🛣️ Autonomie</span>
                                            <span className="font-black text-blue-700">{v.autonomie || v.autonomieMax} km</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CatalogueVehicules;