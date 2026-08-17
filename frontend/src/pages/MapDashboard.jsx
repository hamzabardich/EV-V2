import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MapView from '../components/MapView';
import SearchForm from '../components/SearchForm';
import RouteSummary from '../components/RouteSummary';

const MapDashboard = () => {
    const [routeData, setRouteData] = useState(null);
    const [searchParams, setSearchParams] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (location.state && location.state.rechargeTrajet) {
            const trajet = location.state.rechargeTrajet;

            const rechargerAncienTrajet = async () => {
                try {
                    const url = `http://localhost:8080/api/routing/trajet?startLon=${trajet.startLongitude}&startLat=${trajet.startLatitude}&endLon=${trajet.endLongitude}&endLat=${trajet.endLatitude}`;
                    const headers = {};
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const response = await fetch(url, { method: 'GET', headers });
                    if (!response.ok) throw new Error("Erreur lors du recalcul de l'historique.");

                    const data = await response.json();
                    setRouteData(data);

                    setSearchParams({
                        startPoint: { lat: trajet.startLatitude, lon: trajet.startLongitude },
                        endPoint: { lat: trajet.endLatitude, lon: trajet.endLongitude },
                        selectedVehicule: '',
                        isClimActive: false,
                        chargeUtileKg: 0
                    });

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

            setRouteData(await response.json());
        } catch (error) {
            console.error("Erreur vers la borne:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* 🌟 NAVBAR CLEAN SAAS - FINYOURWAY */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex justify-between items-center">

                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-800 hidden sm:block">
                            FindYour<span className="text-blue-600">Way</span>
                        </span>
                    </Link>

                    {/* MENU DE NAVIGATION */}
                    <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <Link to="/catalogue-vehicules" className="text-slate-600 hover:text-blue-600 font-semibold px-3 py-2 transition-colors whitespace-nowrap">Modèles 🚗</Link>
                        <Link to="/catalogue-bornes" className="text-slate-600 hover:text-emerald-600 font-semibold px-3 py-2 transition-colors whitespace-nowrap">Bornes 🔌</Link>

                        <div className="h-6 w-px bg-slate-300 mx-2 hidden md:block"></div>

                        {token ? (
                            <div className="flex gap-2 items-center">
                                <Link to="/historique" className="text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 transition-colors whitespace-nowrap">Historique</Link>
                                <Link to="/garage" className="text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 transition-colors whitespace-nowrap">Garage</Link>
                                <Link to="/profil" className="text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 transition-colors whitespace-nowrap">Profil</Link>
                                <Link to="/admin" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap">Admin 👑</Link>
                                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-semibold px-3 py-2 transition-colors whitespace-nowrap">Déconnexion</button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                                Se connecter
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* CONTENU PRINCIPAL */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
                {/* Colonne Recherche & Résumé */}
                <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col gap-6 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <SearchForm onRouteCalculated={handleRouteCalculated} />
                    </div>
                    <RouteSummary data={routeData} onNavigateToBorne={handleNavigateToBorne} />
                </div>

                {/* Colonne Carte */}
                <div className="w-full flex-1 min-h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <MapView routeData={routeData} />
                </div>
            </main>
        </div>
    );
};

export default MapDashboard;