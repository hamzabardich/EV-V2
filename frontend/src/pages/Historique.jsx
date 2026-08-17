import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Historique = () => {
    const [trajets, setTrajets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistorique = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            try {
                const response = await fetch('http://localhost:8080/api/trajets/historique', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Impossible de charger votre historique.");
                setTrajets(await response.json());
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistorique();
    }, [navigate]);

    const handleRechargerTrajet = (trajet) => {
        navigate('/', { state: { rechargeTrajet: trajet } });
    };

    const exporterEnCSV = () => {
        if (trajets.length === 0) return toast.warning("Aucun trajet à exporter.");
        let csvContent = "ID Trajet,Distance (km),Duree (minutes),Vehicule\n";
        trajets.forEach(trajet => {
            const vehiculeNom = trajet.vehicule ? `${trajet.vehicule.marque} ${trajet.vehicule.modele}` : "Aucun";
            csvContent += `${trajet.id},${trajet.distanceKm},${trajet.dureeMinutes},${vehiculeNom}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "mon_historique_trajets.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("📥 Fichier CSV téléchargé !");
    };

    const totalDistance = trajets.reduce((acc, trajet) => acc + (trajet.distanceKm || 0), 0);
    const co2Economise = (totalDistance * 0.12).toFixed(1);
    const arbresEquivalents = Math.floor(co2Economise / 21);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-12">
            {/* 🎨 HALOS LUMINEUX FINYOURWAY */}
            <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>

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
                    <div className="flex gap-3">
                        <button onClick={exporterEnCSV} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-2 px-5 rounded-xl transition-all shadow-sm border border-emerald-200 flex items-center gap-2">
                            📥 <span className="hidden sm:inline">CSV</span>
                        </button>
                        <Link to="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                            <span>←</span> <span className="hidden sm:inline">Retour carte</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 mb-2">Mon Historique 📜</h1>
                    <p className="text-slate-500 font-medium text-lg">Retrouvez vos anciens itinéraires et votre impact écologique.</p>
                </div>

                {isLoading ? (
                    <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Chargement de l'historique...</div>
                ) : erreur ? (
                    <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-600 p-6 rounded-2xl font-medium">{erreur}</div>
                ) : trajets.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-md p-12 rounded-[2rem] border border-dashed border-slate-300 text-center flex flex-col items-center justify-center min-h-[300px]">
                        <span className="text-6xl mb-4 opacity-50">🌍</span>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun trajet pour le moment</h3>
                        <p className="text-slate-500 mb-6">Planifiez votre premier itinéraire électrique sur la carte.</p>
                        <Link to="/" className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-1">
                            Planifier un trajet
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* 🌍 BANIÈRE ÉCO-SCORE PREMIUM */}
                        <div className="mb-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] shadow-xl shadow-emerald-500/20 p-8 flex flex-col md:flex-row items-center gap-8 text-white relative overflow-hidden">
                            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                            <div className="text-7xl bg-white/20 p-5 rounded-[2rem] shadow-inner backdrop-blur-md border border-white/30 z-10">
                                🍃
                            </div>
                            <div className="flex-1 text-center md:text-left z-10">
                                <h2 className="text-3xl font-black mb-2 tracking-tight">Votre Impact Écologique</h2>
                                <p className="text-emerald-50 font-medium text-lg">
                                    En choisissant l'électrique, vous avez évité l'émission de <span className="font-black text-white text-2xl bg-white/20 px-3 py-1 rounded-lg ml-1">{co2Economise} kg</span> de CO₂.
                                </p>
                            </div>
                            {arbresEquivalents > 0 && (
                                <div className="bg-white/20 px-8 py-6 rounded-[1.5rem] text-center shadow-inner border border-white/30 backdrop-blur-md z-10 transform hover:scale-105 transition-transform">
                                    <div className="text-4xl mb-2 filter drop-shadow-md">🌳</div>
                                    <div className="font-bold text-emerald-50">Équivalent à</div>
                                    <div className="font-black text-3xl text-yellow-300 drop-shadow-sm">{arbresEquivalents} arbres</div>
                                    <div className="text-sm font-medium text-emerald-100 mt-1">sauvés cette année</div>
                                </div>
                            )}
                        </div>

                        {/* LISTE DES TRAJETS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {trajets.map((trajet) => (
                                <div key={trajet.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between group hover:-translate-y-1 transition-all hover:shadow-xl hover:shadow-emerald-500/10">
                                    <div>
                                        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                                            <h2 className="text-xl font-extrabold text-slate-800">Trajet #{trajet.id}</h2>
                                            <span className="bg-emerald-50 text-emerald-600 text-xs font-black px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                                - {(trajet.distanceKm * 0.12).toFixed(1)} kg CO₂
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-3 text-slate-600 mb-6">
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-500 text-sm">📏 Distance</span>
                                                <span className="font-black text-slate-800">{trajet.distanceKm} km</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-500 text-sm">⏱️ Durée</span>
                                                <span className="font-black text-slate-800">{trajet.dureeMinutes} min</span>
                                            </div>
                                            {trajet.vehicule && (
                                                <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl mt-1 border border-blue-100/50">
                                                    <span className="font-semibold text-blue-600 text-sm">🚗 Véhicule</span>
                                                    <span className="font-bold text-blue-900 text-right text-sm">
                                                        {trajet.vehicule.marque} {trajet.vehicule.modele}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button onClick={() => handleRechargerTrajet(trajet)} className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-3.5 px-4 rounded-xl transition-colors border border-blue-100 hover:border-transparent flex items-center justify-center gap-2">
                                        <span>🗺️</span> Recharger sur la carte
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Historique;