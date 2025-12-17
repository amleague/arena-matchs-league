import React, { useEffect, useState } from 'react';
import { db } from '../services/store';
import { LogOut, User } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const load = async () => setUser(await db.getCurrentUser());
        load();
    }, []);

    const handleLogout = async () => {
        await db.logout();
        window.location.href = '/login';
    };

    if (!user) return null;

    return (
        <div className="container animate-fade" style={{ paddingTop: '1rem' }}>
            <h1 className="font-bold text-xl mb-6">Mon Profil</h1>

            <div className="card flex items-center gap-4 mb-6">
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="font-bold text-lg">{user.name}</h2>
                    <p className="text-muted text-sm">{user.city} • {user.role}</p>
                </div>
            </div>

            <div className="card mb-6">
                <h3 className="font-bold mb-4">Informations</h3>
                <div className="space-y-2">
                    <p className="text-sm text-muted">Email</p>
                    <p>{user.email}</p>
                    <hr style={{ borderColor: 'var(--border-color)', opacity: 0.3, margin: '1rem 0' }} />
                    <p className="text-sm text-muted">Membre depuis</p>
                    <p>Janvier 2025</p>
                </div>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary w-full flex gap-2 text-accent" style={{ borderColor: 'var(--accent)' }}>
                <LogOut size={18} /> Se déconnecter
            </button>

            {/* DEV TOOLS */}
            <div className="mt-8 pt-4 border-t border-color opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-xs text-muted mb-2 uppercase font-bold text-center">Zone de Test (MVP)</p>
                <button
                    onClick={async () => {
                        const myTeams = await db.getMyTeams();
                        if (myTeams.length === 0) return alert("Créez d'abord une équipe !");

                        // Pick a random rival team (not mine)
                        const allTeams = await db.getAllTeams();
                        const rivals = allTeams.filter(t => t.owner_id !== user.id);
                        if (rivals.length === 0) return alert("Pas d'équipe rivale en base.");

                        const rival = rivals[Math.floor(Math.random() * rivals.length)];

                        await db.createChallenge({
                            from_team_id: rival.id,
                            to_team_id: myTeams[0].id, // Target my first team
                            date: new Date(Date.now() + 86400000 * 7).toISOString(),
                            location: 'Stade de Test (Simulé)',
                            message: 'Salut ! Match amical pour tester notre nouvelle compo ?',
                            status: 'PENDING'
                        });
                        alert(`Défi simulé reçu de la part de ${rival.name} ! Allez voir votre Inbox.`);
                    }}
                    className="btn btn-secondary w-full text-xs"
                >
                    ⚡ Simuler un défi reçu (Démo)
                </button>
            </div>
        </div>
    );
};

export default Profile;
