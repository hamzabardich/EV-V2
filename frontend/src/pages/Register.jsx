import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // L'œil
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // 🧠 LOGIQUE DE LA JAUGE DE SÉCURITÉ
    const calculateStrength = (pwd) => {
        let score = 0;
        if (!pwd) return 0;
        if (pwd.length > 5) score += 1;
        if (pwd.length > 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1; // Contient une majuscule
        if (/[0-9]/.test(pwd)) score += 1; // Contient un chiffre
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1; // Contient un caractère spécial
        return Math.min(score, 4); // Score de 0 à 4
    };

    const strength = calculateStrength(password);
    const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const strengthLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort'];

    const handleRegister = async (e) => {
        e.preventDefault();

        if (strength < 2) {
            toast.warning("Votre mot de passe est trop faible !");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, email, password })
            });

            if (!response.ok) throw new Error("Erreur lors de la création du compte.");

            toast.success("Compte créé avec succès ! Vous pouvez vous connecter.");
            navigate('/login');

        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-slate-200">
                <h1 className="text-3xl font-extrabold text-slate-800 text-center mb-6">Créer un compte ⚡</h1>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Nom Complet</label>
                        <input
                            type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Salaheddine"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Email</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="vous@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                            <button
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-blue-600 transition"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>

                        {/* 🌟 LA BARRE DE PROGRESSION DU MOT DE PASSE */}
                        {password && (
                            <div className="mt-2">
                                <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div key={level} className={`h-full w-1/4 transition-colors duration-300 ${strength >= level ? strengthColors[strength] : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                                <p className={`text-xs font-bold mt-1 text-right ${strength > 0 ? strengthColors[strength].replace('bg-', 'text-') : ''}`}>
                                    {strengthLabels[strength]}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className={`w-full text-white font-bold py-3 rounded-lg mt-2 transition shadow-md ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLoading ? 'Création en cours...' : 'Rejoindre la plateforme'}
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-500 text-sm">
                    Déjà un compte ? <Link to="/login" className="text-blue-600 font-bold hover:underline">Se connecter</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;