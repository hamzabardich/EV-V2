import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// ✅ IMPORT DE TOASTIFY
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [stats, setStats] = useState(null);
    const [vehicules, setVehicules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    // ✅ DEUX STATES SÉPARÉS POUR LA RECHERCHE
    const [searchTermUser, setSearchTermUser] = useState('');
    const [searchTermVehicule, setSearchTermVehicule] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [currentVehicule, setCurrentVehicule] = useState(null);
    const [vehiculeForm, setVehiculeForm] = useState({ marque: '', modele: '', capaciteBatterie: '', autonomie: '' });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [resUsers, resStats, resVehicules] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/utilisateurs', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:8080/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:8080/api/vehicules')
                ]);

                if (resUsers.status === 403) throw new Error("⛔ Accès refusé : Droits d'Administrateur requis.");
                if (!resUsers.ok || !resStats.ok || !resVehicules.ok) throw new Error("Erreur de récupération des données.");

                setUtilisateurs(await resUsers.json());
                setStats(await resStats.json());
                setVehicules(await resVehicules.json());
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate, token]);

    const handleDeleteUtilisateur = async (id, nom) => {
        if (!window.confirm(`⚠️ Attention : Voulez-vous vraiment supprimer l'utilisateur "${nom}" ?`)) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/utilisateurs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.erreur || "Erreur de suppression");
            }
            setUtilisateurs(utilisateurs.filter(u => u.id !== id));
            // ✅ UTILISATION DE TOAST ICI
            toast.success("Utilisateur supprimé avec succès.");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const openModal = (vehicule = null) => {
        if (vehicule) {
            setCurrentVehicule(vehicule);
            setVehiculeForm({ marque: vehicule.marque, modele: vehicule.modele, capaciteBatterie: vehicule.capaciteBatterie, autonomie: vehicule.autonomie });
        } else {
            setCurrentVehicule(null);
            setVehiculeForm({ marque: '', modele: '', capaciteBatterie: '', autonomie: '' });
        }
        setShowModal(true);
    };

    const handleSaveVehicule = async (e) => {
        e.preventDefault();
        const url = currentVehicule
            ? `http://localhost:8080/api/admin/vehicules/${currentVehicule.id}`
            : `http://localhost:8080/api/admin/vehicules`;
        const method = currentVehicule ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(vehiculeForm)
            });

            if (!response.ok) throw new Error("Erreur lors de la sauvegarde du véhicule.");
            const savedVehicule = await response.json();

            if (currentVehicule) {
                setVehicules(vehicules.map(v => v.id === savedVehicule.id ? savedVehicule : v));
                toast.success("Véhicule modifié !");
            } else {
                setVehicules([...vehicules, savedVehicule]);
                toast.success("Nouveau véhicule ajouté !");
            }
            setShowModal(false);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteVehicule = async (id, marque) => {
        if (!window.confirm(`Voulez-vous supprimer le modèle ${marque} du catalogue ?`)) return;
        try {
            const response = await fetch(`http://localhost:8080/api/admin/vehicules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression.");
            setVehicules(vehicules.filter(v => v.id !== id));
            toast.success("Véhicule retiré du catalogue.");
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ FILTRES SÉPARÉS
    const filteredUsers = utilisateurs.filter(u =>
        u.nom.toLowerCase().includes(searchTermUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTermUser.toLowerCase())
    );

    const filteredVehicules = vehicules.filter(v =>
        v.marque.toLowerCase().includes(searchTermVehicule.toLowerCase()) ||
        v.modele.toLowerCase().includes(searchTermVehicule.toLowerCase())
    );

    const COLORS = ['#10b981', '#6366f1'];
    const pieData = stats ? [
        { name: 'Utilisateurs', value: stats.userCount },
        { name: 'Administrateurs', value: stats.adminCount }
    ] : [];
    const barData = stats ? [
        { name: '< 100km', trajets: stats.petitsTrajets },
        { name: '100 - 300km', trajets: stats.moyensTrajets },
        { name: '> 300km', trajets: stats.longsTrajets }
    ] : [];

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 relative">
            <header className="mb-6 flex justify-between items-center bg-slate-900 p-4 rounded-xl shadow-md border border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Dashboard Admin 👑</h1>
                    <p className="text-slate-400">Centre de contrôle global (Utilisateurs & Flotte).</p>
                </div>
                <Link to="/" className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition">
                    Retour à la carte
                </Link>
            </header>

            {isLoading ? (
                <div className="text-center p-8 text-slate-600 font-semibold">Chargement des données analytiques...</div>
            ) : erreur ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm">
                    <p className="font-bold text-lg">{erreur}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">

                    {/* SECTION 1 : Cartes KPI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                            <div className="text-4xl">👥</div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Inscrits</p>
                                <p className="text-2xl font-extrabold text-slate-800">{stats.totalUsers}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                            <div className="text-4xl">⚡</div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Véhicules (Total)</p>
                                <p className="text-2xl font-extrabold text-slate-800">{stats.totalVehicules}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                            <div className="text-4xl">🛣️</div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Trajets</p>
                                <p className="text-2xl font-extrabold text-slate-800">{stats.totalTrajets}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 bg-blue-50 flex items-center gap-4">
                            <div className="text-4xl">🌍</div>
                            <div>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Distance Totale</p>
                                <p className="text-2xl font-extrabold text-blue-900">{stats.distanceTotale.toLocaleString()} km</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 : Graphiques */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Répartition des comptes</h2>
                            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Typologie des trajets</h2>
                            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} /><Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/><Bar dataKey="trajets" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div>
                        </div>
                    </div>

                    {/* SECTION 3 : Tableau des Utilisateurs */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        {/* ✅ BARRE DE RECHERCHE UTILISATEURS */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-800">Gestion des Utilisateurs</h2>
                            <div className="relative w-full sm:w-64">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Chercher un utilisateur..."
                                    value={searchTermUser}
                                    onChange={(e) => setSearchTermUser(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 font-semibold">ID</th>
                                    <th className="p-4 font-semibold">Nom Complet</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Rôle</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="p-4 text-slate-500">#{user.id}</td>
                                        <td className="p-4 font-bold text-slate-800">{user.nom}</td>
                                        <td className="p-4 text-slate-600">{user.email}</td>
                                        <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {user.role}
                                                </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.role !== 'ADMIN' && (
                                                <button onClick={() => handleDeleteUtilisateur(user.id, user.nom)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-md text-sm font-bold transition border border-red-200">
                                                    🗑️ Supprimer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="p-4 text-center text-slate-500">Aucun utilisateur trouvé.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 4 : Tableau du Catalogue Véhicules */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        {/* ✅ BARRE DE RECHERCHE VÉHICULES */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-800">Flotte de Véhicules</h2>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Chercher un véhicule..."
                                        value={searchTermVehicule}
                                        onChange={(e) => setSearchTermVehicule(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button onClick={() => openModal()} className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg transition shadow-sm whitespace-nowrap">
                                    ➕ Ajouter un modèle
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 font-semibold">Marque & Modèle</th>
                                    <th className="p-4 font-semibold">Batterie (kWh)</th>
                                    <th className="p-4 font-semibold">Autonomie (km)</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredVehicules.length > 0 ? filteredVehicules.map((v) => (
                                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-800">{v.marque} {v.modele}</td>
                                        <td className="p-4 text-slate-600">{v.capaciteBatterie} kWh</td>
                                        <td className="p-4 text-slate-600">{v.autonomie} km</td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            <button onClick={() => openModal(v)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded-md text-sm font-bold transition border border-slate-200">
                                                ✏️ Éditer
                                            </button>
                                            <button onClick={() => handleDeleteVehicule(v.id, v.marque)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-md text-sm font-bold transition border border-red-200">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="p-4 text-center text-slate-500">Aucun véhicule trouvé.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* FENÊTRE MODALE */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">
                            {currentVehicule ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
                        </h2>
                        <form onSubmit={handleSaveVehicule} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Marque</label>
                                <input type="text" required value={vehiculeForm.marque} onChange={(e) => setVehiculeForm({...vehiculeForm, marque: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: Tesla" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Modèle</label>
                                <input type="text" required value={vehiculeForm.modele} onChange={(e) => setVehiculeForm({...vehiculeForm, modele: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Ex: Model 3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Batterie (kWh)</label>
                                    <input type="number" step="0.1" required value={vehiculeForm.capaciteBatterie} onChange={(e) => setVehiculeForm({...vehiculeForm, capaciteBatterie: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="60" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Autonomie (km)</label>
                                    <input type="number" required value={vehiculeForm.autonomie} onChange={(e) => setVehiculeForm({...vehiculeForm, autonomie: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="400" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md">
                                    {currentVehicule ? '💾 Enregistrer' : '➕ Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;