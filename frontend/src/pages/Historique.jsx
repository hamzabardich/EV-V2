import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Historique = () => {
    const [trajets, setTrajets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistorique = async () => {
            const token = localStorage.getItem('token');

            // Si on n'est pas connecté, on redirige vers le login
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/trajets/historique', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération de l'historique");
                }

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

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Mon Historique 📜</h1>
                    <p className="text-slate-500">Consultez vos itinéraires précédemment calculés.</p>
                </div>
                <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition">
                    Retour à la carte
                </Link>
            </header>

            {isLoading ? (
                <div className="text-center p-8 text-slate-600 font-semibold">Chargement de votre historique...</div>
            ) : erreur ? (
                <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">{erreur}</div>
            ) : trajets.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500 border border-slate-200">
                    Vous n'avez pas encore de trajets enregistrés. Calculez votre premier itinéraire !
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trajets.map((trajet) => (
                        <div key={trajet.id} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:border-blue-300 transition">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <span className="font-bold text-slate-800">Trajet #{trajet.id}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-full">
                                    Terminé
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 text-sm text-slate-600">
                                {/* Remarque: adapte "distanceKm" avec le nom exact de ton attribut dans Trajet.java si besoin */}
                                <div className="flex justify-between">
                                    <span>🛣️ Distance :</span>
                                    <span className="font-semibold text-slate-900">{trajet.distanceKm || trajet.distance_km || '?'} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>⏱️ Durée estimée :</span>
                                    <span className="font-semibold text-slate-900">
                                        {trajet.dureeMinutes ? `${Math.floor(trajet.dureeMinutes / 60)}h ${Math.floor(trajet.dureeMinutes % 60)}m` : '?'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Historique;