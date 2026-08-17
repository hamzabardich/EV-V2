import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MesVehicules = () => {
    const [vehicules, setVehicules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    const [marque, setMarque] = useState('');
    const [modele, setModele] = useState('');
    const [autonomieMax, setAutonomieMax] = useState('');
    const [capaciteBatterie, setCapaciteBatterie] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return navigate('/login');
        fetchVehicules();
    }, [navigate, token]);

    const fetchVehicules = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/mes-vehicules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Erreur lors du chargement de vos véhicules.");
            setVehicules(await response.json());
        } catch (err) {
            setErreur(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAjouter = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/mes-vehicules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    marque: marque.trim(),
                    modele: modele.trim(),
                    // ⚠️ CORRECTION ICI : On utilise les noms exacts de ton entité Java
                    autonomie: parseFloat(autonomieMax),
                    capaciteBatterie: parseFloat(capaciteBatterie)
                }),
            });
            if (!response.ok) throw new Error("Impossible d'ajouter ce véhicule.");

            setMarque(''); setModele(''); setAutonomieMax(''); setCapaciteBatterie('');
            toast.success("Véhicule ajouté à votre garage !");
            fetchVehicules();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSupprimer = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) return;
        try {
            const response = await fetch(`http://localhost:8080/api/mes-vehicules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression.");
            toast.success("Véhicule retiré du garage.");
            fetchVehicules();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-12">
            {/* 🎨 HALOS LUMINEUX */}
            <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>

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
                        <span>←</span> Retour carte
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 mb-2">Mon Garage 🚘</h1>
                    <p className="text-slate-500 font-medium text-lg">Gérez vos véhicules électriques personnels pour un routage sur-mesure.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* FORMULAIRE D'AJOUT */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white sticky top-28">
                            <h2 className="font-black text-xl mb-6 text-slate-800 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">➕</span> Nouveau véhicule
                            </h2>
                            <form onSubmit={handleAjouter} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Marque</label>
                                    <input type="text" placeholder="Ex: Tesla" required value={marque} onChange={(e) => setMarque(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Modèle</label>
                                    <input type="text" placeholder="Ex: Model 3" required value={modele} onChange={(e) => setModele(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium text-slate-800" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Autonomie</label>
                                        <input type="number" placeholder="km" required min="1" value={autonomieMax} onChange={(e) => setAutonomieMax(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Batterie</label>
                                        <input type="number" placeholder="kWh" required min="1" step="0.1" value={capaciteBatterie} onChange={(e) => setCapaciteBatterie(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium text-slate-800" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-md bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 text-lg">
                                    Ajouter au garage
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* LISTE DES VÉHICULES */}
                    <div className="w-full lg:w-2/3">
                        {isLoading ? (
                            <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Ouverture du garage...</div>
                        ) : erreur ? (
                            <div className="bg-red-50/80 border border-red-200 text-red-600 p-6 rounded-2xl font-medium">{erreur}</div>
                        ) : vehicules.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-md p-12 rounded-[2rem] border border-dashed border-slate-300 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                                <span className="text-6xl mb-4 opacity-50">💨</span>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Votre garage est vide</h3>
                                <p className="text-slate-500">Ajoutez votre premier véhicule via le formulaire pour l'utiliser lors de vos itinéraires.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {vehicules.map(v => (
                                    <div key={v.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between group hover:-translate-y-1 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-extrabold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">{v.marque}</h3>
                                                <p className="font-bold text-slate-500">{v.modele}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl border border-blue-100">
                                                🚘
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-slate-500">Batterie</span>
                                                {/* ⚠️ CORRECTION ICI AUSSI */}
                                                <span className="font-bold text-slate-700">{v.capaciteBatterie} kWh</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-slate-500">Autonomie</span>
                                                {/* ⚠️ CORRECTION ICI AUSSI */}
                                                <span className="font-bold text-emerald-600">{v.autonomie} km</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleSupprimer(v.id)} className="mt-4 w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold py-2.5 rounded-xl transition-colors border border-red-100 hover:border-transparent flex justify-center items-center gap-2">
                                            <span>🗑️</span> Retirer du garage
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MesVehicules;