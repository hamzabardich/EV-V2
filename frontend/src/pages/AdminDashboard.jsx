import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [stats, setStats] = useState(null);
    const [vehicules, setVehicules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    const [searchTermUser, setSearchTermUser] = useState('');
    const [searchTermVehicule, setSearchTermVehicule] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentVehicule, setCurrentVehicule] = useState(null);
    const [vehiculeForm, setVehiculeForm] = useState({ marque: '', modele: '', capaciteBatterie: '', autonomie: '' });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return navigate('/login');
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
            const response = await fetch(`http://localhost:8080/api/admin/utilisateurs/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Erreur de suppression");
            setUtilisateurs(utilisateurs.filter(u => u.id !== id));
            toast.success("Utilisateur supprimé avec succès.");
        } catch (err) { toast.error(err.message); }
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
        const marquePropre = vehiculeForm.marque.trim();
        const modelePropre = vehiculeForm.modele.trim();

        if (!marquePropre || !modelePropre) return toast.warning("Champs vides !");
        if (Number(vehiculeForm.capaciteBatterie) <= 0) return toast.warning("Batterie invalide");
        if (Number(vehiculeForm.autonomie) <= 0) return toast.warning("Autonomie invalide");

        const donneesPropres = { ...vehiculeForm, marque: marquePropre, modele: modelePropre };
        const url = currentVehicule ? `http://localhost:8080/api/admin/vehicules/${currentVehicule.id}` : `http://localhost:8080/api/admin/vehicules`;
        const method = currentVehicule ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(donneesPropres) });
            if (!response.ok) throw new Error("Erreur de sauvegarde.");
            const savedVehicule = await response.json();
            if (currentVehicule) {
                setVehicules(vehicules.map(v => v.id === savedVehicule.id ? savedVehicule : v));
                toast.success("Modifié avec succès !");
            } else {
                setVehicules([...vehicules, savedVehicule]);
                toast.success("Nouveau véhicule ajouté !");
            }
            setShowModal(false);
        } catch (err) { toast.error(err.message); }
    };

    const handleDeleteVehicule = async (id, marque) => {
        if (!window.confirm(`Supprimer le modèle ${marque} ?`)) return;
        try {
            const response = await fetch(`http://localhost:8080/api/admin/vehicules/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Erreur de suppression.");
            setVehicules(vehicules.filter(v => v.id !== id));
            toast.success("Véhicule retiré.");
        } catch (err) { toast.error(err.message); }
    };

    const filteredUsers = utilisateurs.filter(u => u.nom.toLowerCase().includes(searchTermUser.toLowerCase()) || u.email.toLowerCase().includes(searchTermUser.toLowerCase()));
    const filteredVehicules = vehicules.filter(v => v.marque.toLowerCase().includes(searchTermVehicule.toLowerCase()) || v.modele.toLowerCase().includes(searchTermVehicule.toLowerCase()));

    const COLORS = ['#10b981', '#6366f1'];
    const pieData = stats ? [{ name: 'Utilisateurs', value: stats.userCount }, { name: 'Admins', value: stats.adminCount }] : [];
    const barData = stats ? [{ name: '< 100km', trajets: stats.petitsTrajets }, { name: '100-300km', trajets: stats.moyensTrajets }, { name: '> 300km', trajets: stats.longsTrajets }] : [];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-12">
            {/* 🎨 HALOS ADMIN (Violet et Indigo pour le côté "Power User") */}
            <div className="absolute top-[5%] right-[-5%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-400/10 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* 🌟 HEADER SOMBRE FINYOURWAY (Spécial Admin) */}
            <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg shadow-slate-900/10 mb-10">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white hidden sm:block">
                            FindYour<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Way</span> <span className="text-xs ml-1 bg-white/10 text-slate-300 px-2 py-1 rounded-md uppercase tracking-widest font-bold">Admin</span>
                        </span>
                    </Link>
                    <Link to="/" className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm border border-slate-700 hover:-translate-y-0.5 whitespace-nowrap">
                        Quitter le panneau
                    </Link>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto px-4 relative z-10">
                {isLoading ? (
                    <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Chargement de l'espace de contrôle...</div>
                ) : erreur ? (
                    <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-600 p-6 rounded-2xl font-medium">{erreur}</div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* 🪟 SECTION 1 : Cartes KPI Premium */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-3xl shadow-inner border border-blue-100">👥</div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Inscrits</p>
                                    <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.totalUsers}</p>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-3xl shadow-inner border border-emerald-100">⚡</div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Modèles (Catalogue)</p>
                                    <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.totalVehicules}</p>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-3xl shadow-inner border border-orange-100">🛣️</div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Trajets Routés</p>
                                    <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.totalTrajets}</p>
                                </div>
                            </div>
                            {/* Carte "Héros" */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[1.5rem] shadow-xl shadow-slate-900/20 border border-slate-700 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                                <div className="absolute right-[-10%] bottom-[-20%] w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl backdrop-blur-md border border-white/10">🌍</div>
                                <div className="z-10">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Distance Globale</p>
                                    <p className="text-4xl font-black text-white tracking-tight">{stats.distanceTotale.toLocaleString()} <span className="text-xl font-bold opacity-50">km</span></p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2 : Graphiques */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                                <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Répartition des comptes</h2>
                                <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}} /><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer></div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                                <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Typologie des trajets</h2>
                                <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}/><Bar dataKey="trajets" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={45} /></BarChart></ResponsiveContainer></div>
                            </div>
                        </div>

                        {/* SECTION 3 : Tableau Utilisateurs */}
                        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-white">
                            <div className="p-6 md:p-8 bg-white/40 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="text-2xl font-black text-slate-800">Membres FinYourWay</h2>
                                <div className="relative w-full sm:w-72">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
                                    <input type="text" placeholder="Rechercher (nom, email)..." value={searchTermUser} onChange={(e) => setSearchTermUser(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="p-6">ID</th>
                                        <th className="p-6">Utilisateur</th>
                                        <th className="p-6">Rôle</th>
                                        <th className="p-6 text-center">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                            <td className="p-6 text-slate-400 font-bold">#{user.id}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <img src={`https://ui-avatars.com/api/?name=${user.nom}&background=random&color=fff&bold=true`} alt="Avatar" className="w-10 h-10 rounded-full shadow-sm" />
                                                    <div>
                                                        <span className="block font-extrabold text-slate-800">{user.nom}</span>
                                                        <span className="block text-xs font-semibold text-slate-500 mt-0.5">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${user.role === 'ADMIN' ? 'bg-slate-800 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                {user.role !== 'ADMIN' && (
                                                    <button onClick={() => handleDeleteUtilisateur(user.id, user.nom)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                                                        Supprimer
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="p-10 text-center text-slate-500 font-bold text-lg">Aucun utilisateur trouvé.</td></tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SECTION 4 : Tableau Véhicules */}
                        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-white">
                            <div className="p-6 md:p-8 bg-white/40 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="text-2xl font-black text-slate-800">Catalogue Modèles</h2>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-72">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
                                        <input type="text" placeholder="Rechercher..." value={searchTermVehicule} onChange={(e) => setSearchTermVehicule(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                                    </div>
                                    <button onClick={() => openModal()} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-bold py-3 px-6 rounded-xl transition shadow-md shadow-blue-500/20 whitespace-nowrap">
                                        ➕ Nouveau
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="p-6">Véhicule</th>
                                        <th className="p-6">Capacités (Batterie / Auto)</th>
                                        <th className="p-6 text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredVehicules.length > 0 ? filteredVehicules.map((v) => (
                                        <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                            <td className="p-6">
                                                <span className="block font-extrabold text-slate-800 text-lg">{v.marque}</span>
                                                <span className="block text-sm font-bold text-slate-500 mt-0.5">{v.modele}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex gap-2">
                                                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">🔋 {v.capaciteBatterie || v.capacite_batterie || v.capaciteBatterieKwh} kWh</span>
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">🛣️ {v.autonomie || v.autonomieMax} km</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center flex justify-center gap-2 mt-2">
                                                <button onClick={() => openModal(v)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition">✏️ Éditer</button>
                                                <button onClick={() => handleDeleteVehicule(v.id, v.marque)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition">🗑️</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="p-10 text-center text-slate-500 font-bold text-lg">Aucun modèle trouvé.</td></tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FENÊTRE MODALE */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 w-full max-w-md border border-white">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">
                            {currentVehicule ? 'Modifier le véhicule' : 'Nouveau véhicule'}
                        </h2>
                        <form onSubmit={handleSaveVehicule} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Marque</label>
                                <input type="text" required value={vehiculeForm.marque} onChange={(e) => setVehiculeForm({...vehiculeForm, marque: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-medium" placeholder="Ex: Tesla" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Modèle</label>
                                <input type="text" required value={vehiculeForm.modele} onChange={(e) => setVehiculeForm({...vehiculeForm, modele: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-medium" placeholder="Ex: Model 3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Batterie (kWh)</label>
                                    <input type="number" step="0.1" required value={vehiculeForm.capaciteBatterie} onChange={(e) => setVehiculeForm({...vehiculeForm, capaciteBatterie: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-medium" placeholder="60" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Autonomie</label>
                                    <input type="number" required value={vehiculeForm.autonomie} onChange={(e) => setVehiculeForm({...vehiculeForm, autonomie: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-medium" placeholder="400" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">Annuler</button>
                                <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/20">
                                    {currentVehicule ? 'Sauvegarder' : '➕ Ajouter'}
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