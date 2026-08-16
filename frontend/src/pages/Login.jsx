import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 🌟 NOUVEAU : L'état pour l'œil
    const [showPassword, setShowPassword] = useState(false);

    const [erreur, setErreur] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErreur('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error("Email ou mot de passe incorrect.");
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            toast.success("Bienvenue ! Connexion réussie.");
            navigate('/');

        } catch (err) {
            setErreur(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-slate-200">
                <h1 className="text-3xl font-extrabold text-slate-800 text-center mb-6">Connexion ⚡</h1>

                {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-bold text-center">{erreur}</div>}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="vous@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Mot de passe</label>
                        {/* 🌟 NOUVEAU : Wrapper relatif pour placer l'œil à l'intérieur */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                            {/* Le bouton "Œil" */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-blue-600 transition"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white font-bold py-3 rounded-lg mt-2 transition shadow-md ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-500 text-sm">
                    Pas encore de compte ? <Link to="/register" className="text-blue-600 font-bold hover:underline">Créer un compte</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;