import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MonCompte = () => {
    const [profil, setProfil] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    // Nouveaux états pour la modification
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ nom: '', email: '' });
    const [isSaving, setIsSaving] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProfil = async () => {
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/auth/me', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error("Impossible de charger le profil.");

                const data = await response.json();
                setProfil(data);
                setFormData({ nom: data.nom, email: data.email });
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfil();
    }, [navigate, token]);

    // Gère la saisie dans les champs de texte
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gère la sauvegarde des modifications
    const handleSave = async () => {
        setIsSaving(true);
        setErreur('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || "Erreur lors de la mise à jour.");
            }

            const data = await response.json();

            // Si l'utilisateur a changé son email, son Token JWT n'est plus valide. On le déconnecte.
            if (data.needToRelogin) {
                alert("Votre email a été modifié. Veuillez vous reconnecter.");
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setProfil(data.user);
                setIsEditing(false);
            }
        } catch (err) {
            setErreur(err.message);
        } finally {
            setIsSaving(false);
        }
    };

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
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-4">{erreur}</div>
                ) : null}

                {profil && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6 relative">

                        {/* Bouton Éditer / Annuler */}
                        <div className="absolute top-6 right-6">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold py-2 px-4 rounded-lg transition"
                                >
                                    ✏️ Modifier
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({ nom: profil.nom, email: profil.email }); // Annuler remet les valeurs de base
                                        setErreur('');
                                    }}
                                    className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg transition"
                                >
                                    ❌ Annuler
                                </button>
                            )}
                        </div>

                        {/* En-tête du profil */}
                        <div className="flex items-center gap-4 border-b pb-6">
                            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
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

                        {/* Formulaire des données */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Nom complet</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-white border border-blue-400 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                                        {profil.nom}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Adresse Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-white border border-blue-400 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                                        {profil.email}
                                    </div>
                                )}
                                {isEditing && (
                                    <p className="text-xs text-amber-600 mt-1">⚠️ Modifier votre email vous déconnectera de la session actuelle.</p>
                                )}
                            </div>

                            {/* Bouton de sauvegarde */}
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`mt-4 w-full text-white font-bold py-3 rounded-lg transition shadow-md ${
                                        isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isSaving ? 'Enregistrement...' : '✅ Sauvegarder les modifications'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonCompte;