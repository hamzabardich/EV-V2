import { useState } from 'react';
import MapView from './components/MapView';
import SearchForm from './components/SearchForm';
import RouteSummary from './components/RouteSummary'; // <-- Ajout de l'import

function App() {
    const [routeData, setRouteData] = useState(null);

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
                    <SearchForm onRouteCalculated={setRouteData} />

                    {/* Le résumé s'affichera ici uniquement si routeData contient des infos */}
                    <RouteSummary data={routeData} />
                </div>

                <div className="w-full lg:w-2/3">
                    <MapView routeData={routeData} />
                </div>

            </div>
        </div>
    );
}

export default App;