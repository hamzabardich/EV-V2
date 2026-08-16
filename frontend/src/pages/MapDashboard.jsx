import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 👈 Ajout de useLocation
import MapView from '../components/MapView';
import SearchForm from '../components/SearchForm';
import RouteSummary from '../components/RouteSummary';

const MapDashboard = () => {
    const [routeData, setRouteData] = useState(null);
    const [searchParams, setSearchParams] = useState(null);

    const navigate = useNavigate();
    const location = useLocation(); // 👈 Permet de lire les données envoyées par d'autres pages
    const token = localStorage.getItem('token');

    // 🌟 NOUVEAU : Le détecteur de rechargement depuis l'historique
    useEffect(() => {
        if (location.state && location.state.rechargeTrajet) {
            const trajet = location.state.rechargeTrajet;

            const rechargerAncienTrajet = async () => {
                try {
                    // On reconstruit l'URL avec les coordonnées de l'ancien trajet
                    const url = `http://localhost:8080/api/routing/trajet?startLon=${trajet.startLongitude}&startLat=${trajet.startLatitude}&endLon=${trajet.endLongitude}&endLat=${trajet.endLatitude}`;

                    const headers = {};
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const response = await fetch(url, { method: 'GET', headers });
                    if (!response.ok) throw new Error("Erreur lors du recalcul de l'historique.");

                    const data = await response.json();
                    setRouteData(data);

                    // On met à jour les paramètres pour que le composant de résumé fonctionne
                    setSearchParams({
                        startPoint: { lat: trajet.startLatitude, lon: trajet.startLongitude },
                        endPoint: { lat: trajet.endLatitude, lon: trajet.endLongitude },
                        selectedVehicule: '',
                        isClimActive: false,
                        chargeUtileKg: 0
                    });

                    // 🧹 Très important : on nettoie l'historique de navigation.
                    // Ça évite que le trajet se recalcule à l'infini si l'utilisateur rafraîchit la page (F5).
                    window.history.replaceState({}, document.title);

                } catch (error) {
                    console.error("Erreur de rechargement:", error);
                    alert("Impossible de recharger ce trajet sur la carte.");
                }
            };

            rechargerAncienTrajet();
        }
    }, [location.state, token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate(0);
    };

    const handleRouteCalculated = (data, params) => {
        setRouteData(data);
        if (params) setSearchParams(params);
    };

    const handleNavigateToBorne = async (borne) => {
        if (!searchParams) return;
        try {
            const url = `http://localhost:8080/api/routing/trajet?startLon=${searchParams.startPoint.lon}&startLat=${searchParams.startPoint.lat}&endLon=${searchParams.endPoint.lon}&endLat=${searchParams.endPoint.lat}&wpLon=${borne.longitude}&wpLat=${borne.latitude}&vehiculeId=${searchParams.selectedVehicule}&isClimActive=${searchParams.isClimActive}&chargeUtileKg=${searchParams.chargeUtileKg}`;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(url, { method: 'GET', headers });
            if (!response.ok) throw new Error("Erreur lors du recalcul vers la borne");

            const data = await response.json();
            setRouteData(data);
        } catch (error) {
            console.error("Erreur vers la borne:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Planificateur EV ⚡</h1>
                    <p className="text-slate-500">Trouvez le meilleur trajet avec les bornes de recharge adaptées.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <Link to="/catalogue-vehicules" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-2 px-4 rounded-lg transition border border-slate-200">
                        🚗 Modèles
                    </Link>
                    <Link to="/catalogue-bornes" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-2 px-4 rounded-lg transition border border-slate-200">
                        🔌 Bornes Maroc
                    </Link>

                    {token ? (
                        <>
                            <Link to="/admin" className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold py-2 px-4 rounded-lg transition">👑 Admin</Link>
                            <Link to="/profil" className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg transition">👤 Profil</Link>
                            <Link to="/garage" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold py-2 px-4 rounded-lg transition">Mon Garage</Link>
                            <Link to="/historique" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold py-2 px-4 rounded-lg transition">Mon Historique</Link>
                            <button onClick={handleLogout} className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-2 px-4 rounded-lg transition">Se déconnecter</button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md">Se connecter</Link>
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