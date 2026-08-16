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
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/trajets/historique', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error("Impossible de charger votre historique.");

                const data = await response.json();
                setTrajets(data);
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

    // ==========================================
    // 📥 NOUVEAU : Fonction d'export CSV
    // ==========================================
    const exporterEnCSV = () => {
        if (trajets.length === 0) {
            toast.warning("Aucun trajet à exporter.");
            return;
        }

        // 1. En-têtes des colonnes pour Excel
        let csvContent = "ID Trajet,Distance (km),Duree (minutes),Vehicule\n";

        // 2. Ajout de chaque trajet sous forme de ligne texte
        trajets.forEach(trajet => {
            const vehiculeNom = trajet.vehicule ? `${trajet.vehicule.marque} ${trajet.vehicule.modele}` : "Aucun";
            csvContent += `${trajet.id},${trajet.distanceKm},${trajet.dureeMinutes},${vehiculeNom}\n`;
        });

        // 3. Création du fichier et déclenchement du téléchargement
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "mon_historique_trajets.csv"); // Nom du fichier
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("📥 Fichier CSV téléchargé !");
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Mon Historique 📜</h1>
                    <p className="text-slate-500">Retrouvez et rechargez vos anciens itinéraires.</p>
                </div>

                {/* NOUVEAU : Les deux boutons en haut */}
                <div className="flex gap-3">
                    <button
                        onClick={exporterEnCSV}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold py-2 px-4 rounded-lg transition border border-emerald-300"
                    >
                        📥 Télécharger (CSV)
                    </button>
                    <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition">
                        Retour à la carte
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                {isLoading ? (
                    <div className="text-center p-8 text-slate-600 font-semibold">Chargement de vos trajets...</div>
                ) : erreur ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">{erreur}</div>
                ) : trajets.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                        <p className="text-slate-500 text-lg">Vous n'avez pas encore de trajets enregistrés.</p>
                        <Link to="/" className="inline-block mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition hover:bg-blue-700">
                            Planifier mon premier trajet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trajets.map((trajet) => (
                            <div key={trajet.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2">Trajet #{trajet.id}</h2>

                                    <div className="flex flex-col gap-2 text-slate-600 mb-4">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">📏 Distance :</span>
                                            <span>{trajet.distanceKm} km</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold">⏱️ Durée estimée :</span>
                                            <span>{trajet.dureeMinutes} min</span>
                                        </div>
                                        {trajet.vehicule && (
                                            <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                                                <span className="font-semibold">🚗 Véhicule :</span>
                                                <span className="text-blue-600 font-medium">{trajet.vehicule.marque} {trajet.vehicule.modele}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRechargerTrajet(trajet)}
                                    className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold py-3 px-4 rounded-lg transition border border-blue-200 hover:border-blue-600 shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span>🗺️</span> Recharger sur la carte
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Historique;