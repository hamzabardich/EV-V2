import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapDashboard from './pages/MapDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Historique from './pages/Historique';
import AdminDashboard from './pages/AdminDashboard';
import MesVehicules from './pages/MesVehicules';
import MonCompte from './pages/MonCompte';
import CatalogueVehicules from './pages/CatalogueVehicules';
import CatalogueBornes from './pages/CatalogueBornes';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🛡️ NOUVEAU : LE GARDIEN DE ROUTE
// Il vérifie si le token existe. Sinon, retour à la case Login !
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />

            <Routes>
                {/* 🔓 Routes Publiques (Tout le monde y a accès) */}
                <Route path="/" element={<MapDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/catalogue-vehicules" element={<CatalogueVehicules />} />
                <Route path="/catalogue-bornes" element={<CatalogueBornes />} />

                {/* 🔒 Routes Privées (Protégées par le Gardien) */}
                <Route path="/historique" element={<ProtectedRoute><Historique /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/garage" element={<ProtectedRoute><MesVehicules /></ProtectedRoute>} />
                <Route path="/profil" element={<ProtectedRoute><MonCompte /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;