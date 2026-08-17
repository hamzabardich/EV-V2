import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const emailNettoye = email.trim();
        if (!emailNettoye || !password) {
            toast.warning("Veuillez remplir tous les champs.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailNettoye, password })
            });
            if (!response.ok) throw new Error("Email ou mot de passe incorrect.");

            const data = await response.json();
            localStorage.setItem('token', data.token);
            toast.success("Bienvenue sur FinYourWay !");
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* 🎨 HALOS LUMINEUX FINYOURWAY (Bleu & Émeraude) */}
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-blue-400/40 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-emerald-400/30 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white max-w-md w-full z-10">

                {/* 🌟 LOGO FINYOURWAY CENTRÉ */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform hover:scale-105 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-800">
                        FindYour<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Way</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Connectez-vous pour optimiser vos trajets.</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Adresse Email</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
                            placeholder="vous@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
                                placeholder="••••••••"
                            />
                            <button
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className={`w-full text-white font-bold py-4 rounded-2xl mt-4 transition-all duration-300 shadow-md flex justify-center items-center gap-2 text-lg
                        ${isLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30'}`}
                    >
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-8 text-center text-slate-500 font-medium">
                    Pas encore de compte ? <Link to="/register" className="text-blue-600 font-bold hover:text-emerald-500 transition-colors">Rejoignez-nous</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;