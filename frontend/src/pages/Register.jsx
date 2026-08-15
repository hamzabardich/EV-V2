import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erreur, setErreur] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErreur('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // On envoie le nom, l'email et le mot de passe comme attendu par Spring Boot
                body: JSON.stringify({ nom, email, password }),
            });

            if (!response.ok) {
                // Si l'email existe déjà, le backend renvoie une erreur
                throw new Error("Erreur lors de l'inscription. Cet email est peut-être déjà utilisé.");
            }

            const data = await response.json();

            // On sauvegarde le Token JWT reçu
            localStorage.setItem('token', data.token);

            // On redirige vers la carte avec une session active !
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
                    <h1 className="text-3xl font-extrabold text-slate-800">Créer un compte 🚀</h1>
                    <p className="text-slate-500 mt-2">Rejoignez-nous pour sauvegarder vos itinéraires.</p>
                </div>

                {erreur && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {erreur}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                        <input
                            type="text"
                            required
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

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
                            isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {isLoading ? 'Création en cours...' : "S'inscrire"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;