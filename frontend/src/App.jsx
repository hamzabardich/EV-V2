import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapDashboard from './pages/MapDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Historique from './pages/Historique';
import AdminDashboard from './pages/AdminDashboard';
import MesVehicules from './pages/MesVehicules';
import MonCompte from './pages/MonCompte';
// 👇 AJOUTE CES DEUX IMPORTS
import CatalogueVehicules from './pages/CatalogueVehicules';
import CatalogueBornes from './pages/CatalogueBornes';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MapDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/historique" element={<Historique />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/garage" element={<MesVehicules />} />
                <Route path="/profil" element={<MonCompte />} />
                {/* 👇 AJOUTE CES DEUX ROUTES */}
                <Route path="/catalogue-vehicules" element={<CatalogueVehicules />} />
                <Route path="/catalogue-bornes" element={<CatalogueBornes />} />
            </Routes>
        </Router>
    );
}

export default App;