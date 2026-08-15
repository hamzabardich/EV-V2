import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MonCompte = () => {
    const [profil, setProfil] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfil = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // On fait un appel au backend pour récupérer les infos de l'utilisateur connecté
                const response = await fetch('http://localhost:8080/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error("Impossible de charger les informations du profil.");

                const data = await response.json();
                setProfil(data);
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfil();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Mon Compte ⚙️</h1>
                    <p className="text-slate-500">Gérez vos informations personnelles.</p>
                </div>
                <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition">
                    Retour à la carte
                </Link>
            </header>

            <div className="max-w-2xl mx-auto">
                {isLoading ? (
                    <div className="text-center p-8 text-slate-600 font-semibold">Chargement du profil...</div>
                ) : erreur ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">{erreur}</div>
                ) : profil ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">

                        <div className="flex items-center gap-4 border-b pb-6">
                            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
                                {/* Affiche la première lettre du nom */}
                                {profil.nom ? profil.nom.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{profil.nom}</h2>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                                    profil.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    Rôle : {profil.role}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Adresse Email</label>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                                    {profil.email}
                                </div>
                            </div>

                            {/* Bouton pour une future fonctionnalité de modification */}
                            <button className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition shadow-md">
                                Modifier mon mot de passe (À venir)
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MonCompte;