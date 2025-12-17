import React, { useState } from 'react';
import { db } from '../services/store';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', name: '', city: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister) {
            const result = await db.register(formData);
            if (result.success) {
                window.location.href = '/';
            } else {
                setError(result.message);
            }
        } else {
            const user = await db.login(formData.email, formData.password);
            if (user) {
                window.location.href = '/';
            } else {
                setError('Email ou mot de passe incorrect.');
            }
        }
    };

    return (
        <div className="container flex flex-col justify-center items-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div className="card w-full max-w-md animate-fade">
                <h1 className="text-center font-bold text-2xl mb-2">MatchKid 🏆</h1>
                <p className="text-center text-muted mb-6">La plateforme des futurs champions.</p>

                {error && <div className="badge badge-declined w-full mb-4 text-center p-2">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <>
                            <label>Nom complet</label>
                            <input required className="input" placeholder="Jean Dupont" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <label>Ville</label>
                            <input required className="input" placeholder="Paris" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                        </>
                    )}

                    <label>Email</label>
                    <input required type="email" className="input" placeholder="coach@matchkid.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />

                    <label>Mot de passe</label>
                    <input required type="password" className="input" placeholder="••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        {isRegister ? "S'inscrire" : "Se connecter"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button className="text-primary text-sm font-bold" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? "J'ai déjà un compte" : "Créer un compte"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
