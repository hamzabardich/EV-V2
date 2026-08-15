import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapDashboard from './pages/MapDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Historique from './pages/Historique';
import AdminDashboard from './pages/AdminDashboard'; // 👈 IMPORT DE LA PAGE ADMIN

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MapDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/historique" element={<Historique />} />
                <Route path="/admin" element={<AdminDashboard />} /> {/* 👈 ROUTE MISE À JOUR */}
            </Routes>
        </Router>
    );
}

export default App;