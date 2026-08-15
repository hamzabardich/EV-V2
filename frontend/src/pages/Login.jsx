import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erreur, setErreur] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // Pour rediriger l'utilisateur après la connexion

    const handleLogin = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page
        setIsLoading(true);
        setErreur('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Email ou mot de passe incorrect");
            }

            const data = await response.json();

            // 1. On sauvegarde le Token JWT dans le navigateur (localStorage)
            localStorage.setItem('token', data.token);

            // 2. On redirige vers la carte
            navigate('/');

        } catch (error) {
            setErreur(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800">Bon retour ! ⚡</h1>
                    <p className="text-slate-500 mt-2">Connectez-vous pour accéder à vos trajets et vos véhicules.</p>
                </div>

                {erreur && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {erreur}
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-slate-600">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                        S'inscrire
                    </Link>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="exemple@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full font-semibold py-3 mt-4 rounded-lg transition shadow-md ${
                            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;