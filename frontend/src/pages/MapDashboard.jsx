import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import SearchForm from '../components/SearchForm';
import RouteSummary from '../components/RouteSummary';

const MapDashboard = () => {
    const [routeData, setRouteData] = useState(null);
    const [searchParams, setSearchParams] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token'); // On vérifie si l'utilisateur est connecté

    const handleLogout = () => {
        localStorage.removeItem('token'); // On déchire le passeport
        navigate(0); // Rafraîchit la page pour vider les données
    };

    const handleRouteCalculated = (data, params) => {
        setRouteData(data);
        if (params) {
            setSearchParams(params);
        }
    };

    const handleNavigateToBorne = async (borne) => {
        if (!searchParams) return;

        try {
            // NOUVELLE URL : On garde la destination d'origine et on ajoute la borne en waypoint (wpLon, wpLat)
            const url = `http://localhost:8080/api/routing/trajet?startLon=${searchParams.startPoint.lon}&startLat=${searchParams.startPoint.lat}&endLon=${searchParams.endPoint.lon}&endLat=${searchParams.endPoint.lat}&wpLon=${borne.longitude}&wpLat=${borne.latitude}&vehiculeId=${searchParams.selectedVehicule}&isClimActive=${searchParams.isClimActive}&chargeUtileKg=${searchParams.chargeUtileKg}`;

            // On récupère le token s'il existe
            const token = localStorage.getItem('token');

            // On prépare les en-têtes (Headers) de la requête
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // On envoie la requête avec le token !
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) throw new Error("Erreur lors du recalcul");

            const data = await response.json();
            setRouteData(data);

        } catch (error) {
            console.error("Erreur de routage vers la borne:", error);
            alert("Impossible de calculer l'itinéraire vers cette borne.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        Planificateur EV ⚡
                    </h1>
                    <p className="text-slate-500">Trouvez le meilleur trajet avec les bornes de recharge adaptées.</p>
                </div>

                {/* Zone d'authentification */}
                <div className="flex items-center gap-3">
                    {token ? (
                        <>
                            <Link
                                to="/garage"
                                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold py-2 px-4 rounded-lg transition"
                            >
                                Mon Garage
                            </Link>
                            <Link
                                to="/historique"
                                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold py-2 px-4 rounded-lg transition"
                            >
                                Mon Historique
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-2 px-4 rounded-lg transition"
                            >
                                Se déconnecter
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md"
                        >
                            Se connecter
                        </Link>
                    )}
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
                <div className="w-full lg:w-1/3">
                    <SearchForm onRouteCalculated={handleRouteCalculated} />
                    <RouteSummary data={routeData} onNavigateToBorne={handleNavigateToBorne} />
                </div>

                <div className="w-full lg:w-2/3">
                    <MapView routeData={routeData} />
                </div>
            </div>
        </div>
    );
};

export default MapDashboard;