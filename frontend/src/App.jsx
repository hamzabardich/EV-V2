import { useState } from 'react';
import MapView from './components/MapView';
import SearchForm from './components/SearchForm';
import RouteSummary from './components/RouteSummary';

function App() {
    const [routeData, setRouteData] = useState(null);
    const [searchParams, setSearchParams] = useState(null);

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

            const response = await fetch(url);
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
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold text-slate-800">
                    Planificateur EV ⚡
                </h1>
                <p className="text-slate-500">Trouvez le meilleur trajet avec les bornes de recharge adaptées.</p>
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
}

export default App;