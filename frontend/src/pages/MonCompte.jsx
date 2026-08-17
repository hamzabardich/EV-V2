import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MonCompte = () => {
    const [profil, setProfil] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ nom: '', email: '', password: '', confirmPassword: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProfil = async () => {
            if (!token) return navigate('/login');
            try {
                const response = await fetch('http://localhost:8080/api/auth/me', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Impossible de charger le profil.");
                const data = await response.json();
                setProfil(data);
                setFormData({ nom: data.nom, email: data.email, password: '', confirmPassword: '' });
            } catch (err) {
                setErreur(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfil();
    }, [navigate, token]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("Les nouveaux mots de passe ne correspondent pas !");
        }
        setIsSaving(true);
        setErreur('');
        const dataToSend = { nom: formData.nom, email: formData.email };
        if (formData.password) dataToSend.password = formData.password;

        try {
            const response = await fetch('http://localhost:8080/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(dataToSend)
            });
            if (!response.ok) throw new Error(await response.text() || "Erreur lors de la mise à jour.");

            const data = await response.json();
            if (data.needToRelogin) {
                toast.info("Email modifié. Veuillez vous reconnecter.");
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setProfil(data.user);
                setIsEditing(false);
                setFormData({ ...formData, password: '', confirmPassword: '' });
                toast.success("Profil mis à jour avec succès !");
            }
        } catch (err) {
            toast.error(err.message);
            setErreur(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-12">
            {/* 🎨 HALOS LUMINEUX FINYOURWAY */}
            <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* 🌟 HEADER FINYOURWAY */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm mb-10">
                <div className="max-w-4xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-800 hidden sm:block">
                            FindYour<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Way</span>
                        </span>
                    </Link>
                    <Link to="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                        <span>←</span> Retour carte
                    </Link>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 relative z-10">
                {isLoading ? (
                    <div className="text-center p-8 text-slate-500 font-bold animate-pulse">Chargement du profil...</div>
                ) : erreur ? (
                    <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-600 p-4 rounded-2xl mb-4 font-medium">{erreur}</div>
                ) : profil && (
                    <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white flex flex-col gap-8 relative">

                        <div className="absolute top-8 right-8">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-all border border-blue-100 hover:border-transparent hover:shadow-lg hover:shadow-blue-500/30">
                                    ✏️ Modifier
                                </button>
                            ) : (
                                <button onClick={() => { setIsEditing(false); setFormData({ nom: profil.nom, email: profil.email, password: '', confirmPassword: '' }); setErreur(''); }} className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-2.5 px-5 rounded-xl transition-all">
                                    ❌ Annuler
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-5 border-b border-slate-100 pb-8 mt-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-full blur animate-pulse"></div>
                                <img src={`https://ui-avatars.com/api/?name=${profil.nom}&background=ffffff&color=0ea5e9&bold=true&size=100`} alt="Avatar" className="relative w-24 h-24 rounded-full shadow-md border-4 border-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-800">{profil.nom}</h2>
                                <span className={`inline-block mt-2 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-sm border ${profil.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                    {profil.role}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nom complet</label>
                                {isEditing ? (
                                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium text-slate-800" />
                                ) : (
                                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-700 font-semibold">{profil.nom}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Adresse Email</label>
                                {isEditing ? (
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium text-slate-800" />
                                ) : (
                                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-700 font-semibold">{profil.email}</div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="mt-6 p-6 bg-slate-50/80 rounded-[1.5rem] border border-slate-200">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4">Sécurité</h3>
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nouveau mot de passe</label>
                                            <div className="relative">
                                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none" placeholder="Laisser vide pour ne pas changer" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-blue-600">{showPassword ? "🙈" : "👁️"}</button>
                                            </div>
                                        </div>
                                        {formData.password && (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirmer le mot de passe</label>
                                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full p-4 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/30 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400' : 'border-slate-200'}`} placeholder="Retapez le mot de passe" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isEditing && (
                                <button onClick={handleSave} disabled={isSaving} className={`mt-4 w-full text-white font-bold py-4 rounded-2xl transition-all shadow-md text-lg flex justify-center items-center gap-2 ${isSaving ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30'}`}>
                                    {isSaving ? 'Enregistrement...' : '✅ Sauvegarder les modifications'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonCompte;