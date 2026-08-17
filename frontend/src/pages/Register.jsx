import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const calculateStrength = (pwd) => {
        let score = 0;
        if (!pwd) return 0;
        if (pwd.length > 5) score += 1;
        if (pwd.length > 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return Math.min(score, 4);
    };
    const strength = calculateStrength(password);
    const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];

    const handleRegister = async (e) => {
        e.preventDefault();
        const nomNettoye = nom.trim();
        const emailNettoye = email.trim();

        if (!nomNettoye || !emailNettoye) return toast.warning("Remplissez tous les champs.");
        if (password !== confirmPassword) return toast.error("Les mots de passe ne correspondent pas !");
        if (strength < 2) return toast.warning("Votre mot de passe est trop faible !");

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: nomNettoye, email: emailNettoye, password })
            });
            if (!response.ok) throw new Error("Erreur lors de la création du compte.");
            toast.success("Compte FinYourWay créé avec succès !");
            navigate('/login');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* 🎨 HALOS INVERSÉS */}
            <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-emerald-400/40 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white max-w-md w-full z-10">

                {/* 🌟 LOGO */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-black tracking-tighter text-slate-800 flex items-center gap-2">
                        FindYour<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Way</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Créez votre compte en quelques secondes.</p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nom Complet</label>
                        <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none" placeholder="Ex: Salaheddine" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none" placeholder="vous@email.com" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Mot de passe</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-blue-600">{showPassword ? "🙈" : "👁️"}</button>
                        </div>
                        {password && (
                            <div className="mt-2 ml-1 flex gap-1 h-1.5 w-full">
                                {[1, 2, 3, 4].map((level) => (
                                    <div key={level} className={`h-full w-1/4 rounded-full transition-all ${strength >= level ? strengthColors[strength] : 'bg-slate-200'}`}></div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Confirmer mot de passe</label>
                        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full p-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/30 ${confirmPassword && password !== confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-4 rounded-2xl mt-2 transition-all shadow-md ${isLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30'}`}>
                        {isLoading ? 'Création...' : 'Rejoindre FinYourWay'}
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-500 font-medium">
                    Déjà un compte ? <Link to="/login" className="text-blue-600 font-bold hover:text-emerald-500">Se connecter</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;