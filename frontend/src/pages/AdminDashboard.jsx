import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUtilisateurs = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/admin/utilisateurs', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 403) {
                    throw new Error("⛔ Accès refusé : Vous n'avez pas les droits d'Administrateur.");
                }

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données.");
                }

                const data = await response.json();
                setUtilisateurs(data);
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUtilisateurs();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Zone Administrateur 👑</h1>
                    <p className="text-gray-400">Gestion des utilisateurs de la plateforme.</p>
                </div>
                <Link to="/" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition">
                    Retour au site
                </Link>
            </header>

            {isLoading ? (
                <div className="text-center p-8 text-slate-600 font-semibold">Vérification de vos droits...</div>
            ) : erreur ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm">
                    <p className="font-bold text-lg">{erreur}</p>
                    <p className="mt-2 text-sm text-red-600">Connectez-vous avec un compte ayant le rôle "ADMIN".</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                                <th className="p-4 font-semibold">ID</th>
                                <th className="p-4 font-semibold">Nom Complet</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Rôle</th>
                            </tr>
                            </thead>
                            <tbody>
                            {utilisateurs.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                    <td className="p-4 text-slate-600 font-medium">#{user.id}</td>
                                    <td className="p-4 font-semibold text-slate-800">{user.nom}</td>
                                    <td className="p-4 text-slate-600">{user.email}</td>
                                    <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                    : 'bg-green-100 text-green-700 border border-green-200'
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
            )}
        </div>
    );
};

export default AdminDashboard;