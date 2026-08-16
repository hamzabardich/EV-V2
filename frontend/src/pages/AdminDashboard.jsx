import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [resUsers, resStats] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/utilisateurs', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:8080/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (resUsers.status === 403 || resStats.status === 403) {
                    throw new Error("⛔ Accès refusé : Droits d'Administrateur requis.");
                }

                if (!resUsers.ok || !resStats.ok) throw new Error("Erreur de récupération des données.");

                const dataUsers = await resUsers.json();
                const dataStats = await resStats.json();

                setUtilisateurs(dataUsers);
                setStats(dataStats);
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Couleurs
    const COLORS = ['#10b981', '#6366f1'];

    // Préparation des données pour Recharts
    const pieData = stats ? [
        { name: 'Utilisateurs (USER)', value: stats.userCount },
        { name: 'Administrateurs (ADMIN)', value: stats.adminCount }
    ] : [];

    const barData = stats ? [
        { name: '< 100km', trajets: stats.petitsTrajets },
        { name: '100 - 300km', trajets: stats.moyensTrajets },
        { name: '> 300km', trajets: stats.longsTrajets }
    ] : [];

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-slate-900 p-4 rounded-xl shadow-md border border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Dashboard Admin 📈</h1>
                    <p className="text-slate-400">Centre de contrôle et statistiques globales.</p>
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

                    {/* SECTION 1 : Les 4 Cartes KPI */}
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
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Véhicules</p>
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

                    {/* SECTION 2 : Les Graphiques */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Répartition des comptes</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Typologie des trajets</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                        <Bar dataKey="trajets" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* SECTION 3 : La Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Gestion des Utilisateurs</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 font-semibold">Nom Complet</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Rôle</th>
                                </tr>
                                </thead>
                                <tbody>
                                {utilisateurs.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-800">{user.nom}</td>
                                        <td className="p-4 text-slate-600">{user.email}</td>
                                        <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    user.role === 'ADMIN'
                                                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    {user.role}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AdminDashboard;