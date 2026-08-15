import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapDashboard from './pages/MapDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Historique from './pages/Historique';
import AdminDashboard from './pages/AdminDashboard';
import MesVehicules from './pages/MesVehicules'; // 👈 NOUVEL IMPORT
import MonCompte from './pages/MonCompte';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MapDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/historique" element={<Historique />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profil" element={<MonCompte />} />
                <Route path="/garage" element={<MesVehicules />} /> {/* 👈 NOUVELLE ROUTE */}

            </Routes>
        </Router>
    );
}

export default App;