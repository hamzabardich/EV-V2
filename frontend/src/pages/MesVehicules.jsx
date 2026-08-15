import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MesVehicules = () => {
    const [vehicules, setVehicules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    // États pour le formulaire d'ajout
    const [marque, setMarque] = useState('');
    const [modele, setModele] = useState('');
    const [autonomieMax, setAutonomieMax] = useState('');
    const [capaciteBatterie, setCapaciteBatterie] = useState('');

    const token = localStorage.getItem('token');

    // Charger les véhicules au démarrage
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchVehicules();
    }, [navigate, token]);

    const fetchVehicules = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/mes-vehicules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Erreur lors du chargement de vos véhicules.");
            const data = await response.json();
            setVehicules(data);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAjouter = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/mes-vehicules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    marque,
                    modele,
                    autonomieMax: parseFloat(autonomieMax),
                    capaciteBatterieKwh: parseFloat(capaciteBatterie)
                }),
            });

            if (!response.ok) throw new Error("Impossible d'ajouter ce véhicule.");

            // On vide le formulaire et on recharge la liste
            setMarque(''); setModele(''); setAutonomieMax(''); setCapaciteBatterie('');
            fetchVehicules();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSupprimer = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) return;
        try {
            const response = await fetch(`http://localhost:8080/api/mes-vehicules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression.");
            fetchVehicules(); // Recharge la liste
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Mon Garage 🚘</h1>
                    <p className="text-slate-500">Gérez vos véhicules électriques personnels.</p>
                </div>
                <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition">
                    Retour à la carte
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formulaire d'ajout */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1 h-fit">
                    <h2 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Ajouter un véhicule</h2>
                    <form onSubmit={handleAjouter} className="flex flex-col gap-3">
                        <input type="text" placeholder="Marque (ex: Tesla)" required value={marque} onChange={(e) => setMarque(e.target.value)} className="border p-2 rounded w-full" />
                        <input type="text" placeholder="Modèle (ex: Model 3)" required value={modele} onChange={(e) => setModele(e.target.value)} className="border p-2 rounded w-full" />
                        <input type="number" placeholder="Autonomie Max (km)" required value={autonomieMax} onChange={(e) => setAutonomieMax(e.target.value)} className="border p-2 rounded w-full" />
                        <input type="number" placeholder="Batterie (kWh)" required value={capaciteBatterie} onChange={(e) => setCapaciteBatterie(e.target.value)} className="border p-2 rounded w-full" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mt-2">
                            Ajouter au garage
                        </button>
                    </form>
                </div>

                {/* Liste des véhicules */}
                <div className="md:col-span-2">
                    {isLoading ? (
                        <p className="text-center p-4">Chargement de votre garage...</p>
                    ) : erreur ? (
                        <p className="text-red-500 p-4">{erreur}</p>
                    ) : vehicules.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
                            Votre garage est vide. Ajoutez votre premier véhicule !
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {vehicules.map(v => (
                                <div key={v.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{v.marque} {v.modele}</h3>
                                        <p className="text-sm text-slate-500">🔋 {v.capaciteBatterieKwh} kWh • 🛣️ {v.autonomieMax} km</p>
                                    </div>
                                    <button onClick={() => handleSupprimer(v.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg">
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MesVehicules;